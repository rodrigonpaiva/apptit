/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query Health {\n  health\n}": typeof types.HealthDocument,
    "query Me {\n  me {\n    id\n    email\n    name\n    role\n  }\n}": typeof types.MeDocument,
    "query Products {\n  products {\n    ...ProductFields\n  }\n}": typeof types.ProductsDocument,
    "fragment ProductFields on Product {\n  id\n  name\n  sku\n  price\n}": typeof types.ProductFieldsFragmentDoc,
};
const documents: Documents = {
    "query Health {\n  health\n}": types.HealthDocument,
    "query Me {\n  me {\n    id\n    email\n    name\n    role\n  }\n}": types.MeDocument,
    "query Products {\n  products {\n    ...ProductFields\n  }\n}": types.ProductsDocument,
    "fragment ProductFields on Product {\n  id\n  name\n  sku\n  price\n}": types.ProductFieldsFragmentDoc,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query Health {\n  health\n}"): (typeof documents)["query Health {\n  health\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query Me {\n  me {\n    id\n    email\n    name\n    role\n  }\n}"): (typeof documents)["query Me {\n  me {\n    id\n    email\n    name\n    role\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query Products {\n  products {\n    ...ProductFields\n  }\n}"): (typeof documents)["query Products {\n  products {\n    ...ProductFields\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "fragment ProductFields on Product {\n  id\n  name\n  sku\n  price\n}"): (typeof documents)["fragment ProductFields on Product {\n  id\n  name\n  sku\n  price\n}"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;