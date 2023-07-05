\*\*\*\*# GraphQL Yoga CodeGen starter template

Type-safe Node.js API in the GraphQL specification.

## Batteries included

-   [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)
    > The fully-featured GraphQL Server with focus on easy setup, performance and great developer experience.
-   [GraphQL CodeGen](https://the-guild.dev/graphql/codegen)
    > Generate code from your GraphQL schema and operations with a simple CLI
-   [Prisma](https://www.prisma.io/)
    > Next-generation Node.js and TypeScript ORM
-   Example Queries, Mutations, and even Subscriptions using the server sent events(SSE) protocol
    Documentation - For more on server sent events vs. web sockets refer to [SSE vs. WS](https://the-guild.dev/graphql/yoga-server/docs/features/subscriptions#sse-vs-websocket) in the Guild Yoga Server documentation

![ERD](./prisma/erd.svg)

## Prerequisites

-   [Node.js](https://nodejs.org/) >=16

## How to use from scratch

1. Clone repository

```bash
# ssh (recommended)
git clone git@github.com:keonik/ts-gql-prisma-codegen.git

#https
https://github.com/keonik/ts-gql-prisma-codegen.git
```

2. Move into repository

```bash
cd ts-gql-prisma-codegen
```

3. Create a `.env` file to choose your hosting port and database connection. Feel free to copy below if you don't intend on changing ports and database names

```bash
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="file:./dev.db"
APP_PORT=4040
```

1. Install project dependencies

```bash
# npm
npm install
# yarn
rm package-lock.json
yarn
# pnpm
rm package-lock.json
pnpm install
```

5. Start development server

```bash
npm run dev
```

## Development workflow

This template makes assumptions that you know how to leverage tools like [prisma](https://www.prisma.io/) and [graphQL codegen](https://the-guild.dev/graphql/codegen) but in case you don't have that background, here is a high-level descriptions of the back and forth it takes to enjoy a type-safe end to end development experience.

### Adjusting GraphQL Resolver types

The `src/graphql/codegen.ts` file is the starting point for all changes. If you view this file you will see something similar to this

```ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/graphql/schema.graphql",
  generates: {
    "./src/gen/types/resolvers-types.ts": {
      config: {
        useIndexSignature: true,
      },
      plugins: ["typescript", "typescript-resolvers"],
    },
  },
  config: {
    ...
  },
};
export default config;
```

Take a look above. The important pieces to this configuration is the `schema` and the `generates` keys. The `schema` located at `./src/graphql/schema.graphql` is the initial definition that tells this codegen cli what to generate. So when you want to add, edit, or delete resolver typescript definitions you will add it to that file, or create a new schema if you'd like.

Once you have made an update to your `schema.graphql` file, you can run the cli

```bash
npm run generate-types
```

If you have successfully generated your resolver types you should see the following

```bash
✔ Parse Configuration
✔ Parse Configuration
✔ Generate outputs
```

Since all of this is hooked up already, you can skip straight to the resolvers you will be writing and update types to match inputs and outputs to make TypeScript happy. This is located in `./src/graphql/schema.ts` and should show you TypeScript related errors telling you to match the expected changes you made to your `.graphql` schema.

### Updating database models

[Prisma](https://prisma.io) is the tool for success here. If you take a look at `./prisma/schema.prisma` you will see something like this

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id       Int       @id @default(autoincrement())
  email    String    @unique
  name     String?
  rooms    Room[]
  messages Message[] @ignore
}
```

If you need help understanding how to change these models please refer to [prisma documentation](https://www.prisma.io/docs) directly, as they have amazing documentation to help you get work done with amazing developer experience.

Now if you have made a change here, you haven't quite made the change to your TypeScript definitions or even your database. So lets explain how to update those needed areas.

### TypeScript Definitions

In order for your IDE to recognize your new models or model changes, you need to regenerate your prisma client aka your TypeScript definitions. To do so, we have added a script for quick reference, you could also run this with globally installing Prisma.

```bash
# script included
npm run generate
# global dependency of prisma
prisma generate
```

Once that is done and successful you should now see your model changes reflected when you leverage them in your IDE.

### Database

You need a migration to reflect the updates made to your `prisma/schema.prisma` file. To run this you can run either of the commands below.

```bash
# script included
npm run migrate
# global dependency of prisma
prisma migrate dev
```

Assuming success, you should have a new directory and `.sql` file under the `./prisma/migrations` directory that has been made and applied to your database.

> If you've run into issues please refer to prisma documentation on potential [error codes](https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes)

## Hosting

`npm run build`

`node ./dist/src/index.js`
