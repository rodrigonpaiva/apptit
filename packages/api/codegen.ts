import type { CodegenConfig } from "@graphql-codegen/cli";

const schemaEndpoint =
  process.env.GRAPHQL_ENDPOINT ?? process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

if (!schemaEndpoint) {
  throw new Error(
    "Set GRAPHQL_ENDPOINT or NEXT_PUBLIC_GRAPHQL_ENDPOINT for codegen"
  );
}

const config: CodegenConfig = {
  schema: schemaEndpoint,
  documents: ["packages/api/src/**/*.graphql", "apps/web/src/**/*.graphql"],
  generates: {
    "packages/api/src/generated/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: {
        avoidOptionals: true,
        immutableTypes: true,
        useTypeImports: true,
      },
    },
  },
};

export default config;
