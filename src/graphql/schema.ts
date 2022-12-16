import { createPubSub, createSchema } from "graphql-yoga";
import { readFileSync } from "fs";
import packageJson from "../../package.json";
import { GraphQLContext } from "./context";
import { Message, Resolvers } from "../gen/types/resolvers-types";
import { DateResolver, DateTimeTypeDefinition } from "graphql-scalars";
import { GraphQLError } from "graphql";

const pubSub = createPubSub<{
  "roomId:message": [roomId: string, payload: Message];
}>();

const typeDefs = readFileSync("src/graphql/schema.graphql", "utf8");

const resolvers: Resolvers<GraphQLContext> = {
  DateTime: DateResolver,
  Query: {
    hello: () => "world",
    version: () => packageJson.version,
  },
  Mutation: {
    addMessage: async (_: unknown, { messageInput }, { prisma }) => {
      const newMessage = await prisma.message.create({
        data: messageInput,
      });
      if (!newMessage) {
        throw new GraphQLError("Message not created");
      }
      pubSub.publish("roomId:message", newMessage.roomId, newMessage);
      return newMessage;
    },
  },
  Subscription: {
    room: {
      subscribe: (_: unknown, { roomId }) =>
        pubSub.subscribe("roomId:message", roomId),
      // @ts-ignore
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
