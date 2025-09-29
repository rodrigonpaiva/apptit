import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.CODEGEN_SCHEMA_URL ?? 'apps/api/src/schema.gql',
  documents: [
    'packages/graphql/src/**/*.graphql',
    'apps/web/src/**/*.{ts,tsx}'
  ],
  generates: {
    'packages/graphql/src/generated/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql'
      },
      config: {
        useTypeImports: true,
        dedupeFragments: true,
        documentMode: 'documentNode',
        documentNodeImport: {
          name: 'TypedDocumentNode',
          module: '@graphql-typed-document-node/core'
        },
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, unknown>'
        }
      }
    }
  }
};

export default config;
