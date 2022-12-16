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
    namingConvention: "keep",
    mappers: {
      Message: "@prisma/client#Message",
      Room: "@prisma/client#Room",
      User: "@prisma/client#User",
    },
  },
};
export default config;
