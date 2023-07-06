import { createPubSub, createSchema } from 'graphql-yoga';
import packageJson from '../../package.json';
import { GraphQLContext } from './context';
import { Message, Resolvers } from '../gen/types/resolvers-types';
import { DateTimeResolver, DateTimeTypeDefinition } from 'graphql-scalars';
import { GraphQLError } from 'graphql';
import { readFileSync } from 'node:fs';

const pubSub = createPubSub<{
    'roomId:message': [roomId: string, payload: Message];
}>();

const typeDefs = readFileSync('schema.graphql', 'utf8');

const resolvers: Resolvers<GraphQLContext> = {
    DateTime: DateTimeResolver,
    Query: {
        roomUsers: async (_: unknown, { roomId }, { prisma }) => {
            try {
                const room = await prisma.room.findFirst({
                    where: {
                        id: roomId,
                    },
                    include: {
                        users: true,
                    },
                });
                if (!room) {
                    throw new GraphQLError('Room not found');
                }
                return room?.users;
            } catch (error) {
                throw new GraphQLError('Room not found');
            }
        },
        roomMessages: async (_: unknown, { roomId }, { prisma }) => {
            try {
                const messages = await prisma.message.findMany({
                    where: {
                        roomId,
                    },
                });
                return messages;
            } catch (error) {
                throw new GraphQLError('Room not found');
            }
        },
        version: () => packageJson.version,
    },
    Mutation: {
        addMessage: async (_: unknown, { messageInput }, { prisma }) => {
            const newMessage = await prisma.message.create({
                data: messageInput,
            });
            if (!newMessage) {
                throw new GraphQLError('Message not created');
            }
            pubSub.publish('roomId:message', newMessage.roomId, newMessage);
            return newMessage;
        },
        createRoom: async (_: unknown, { roomId }, { prisma }) => {
            try {
                await prisma.room.create({
                    data: {
                        name: roomId,
                        id: roomId,
                    },
                });
                return true;
            } catch (error) {
                throw new GraphQLError('Room not created');
            }
        },
        createUser: async (_: unknown, { email, name }, { prisma }) => {
            try {
                const userMade = await prisma.user.create({
                    data: {
                        name,
                        email,
                    },
                });
                return userMade;
            } catch (error) {
                throw new GraphQLError('User not created');
            }
        },
    },
    Subscription: {
        room: {
            subscribe: (_: unknown, { roomId }) =>
                pubSub.subscribe('roomId:message', roomId),
            resolve: (payload: Message) => {
                return payload;
            },
        },
    },
};

export default createSchema<GraphQLContext>({
    typeDefs: [DateTimeTypeDefinition, typeDefs],
    resolvers,
});
