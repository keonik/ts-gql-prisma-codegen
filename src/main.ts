import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import schema from './graphql/schema';
import { createContext, GraphQLContext } from './graphql/context';

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga<GraphQLContext>({
    context: () => createContext(),
    schema,
    graphiql: {
        defaultQuery: `query {
    version
}`,
    },
});

// Pass it into a server to hook into request handlers.
const server = createServer(yoga);

const port = process.env.APP_PORT ?? 4040;

// Start the server and you're done!
server.listen(port, () => {
    console.info(
        `\n🚀🚀🚀 Server is running on http://localhost:${port}/graphql 🚀🚀🚀\n`
    );
});
