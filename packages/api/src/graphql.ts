import { print } from "graphql";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { MeDocument } from "./generated/graphql";
import type { MeQuery } from "./generated/graphql";

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type ExecuteOptions = {
  headers?: Record<string, string>;
};

const defaultEndpoint =
  process.env.GRAPHQL_ENDPOINT ?? process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

export async function executeGraphql<TData, TVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
  options: ExecuteOptions = {}
): Promise<TData> {
  if (!defaultEndpoint) {
    throw new Error("GraphQL endpoint is not configured");
  }

  const response = await fetch(defaultEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...options.headers
    },
    body: JSON.stringify({
      query: print(document),
      variables
    })
  });

  const payload = (await response.json()) as GraphqlResponse<TData>;

  if (!response.ok || payload.errors?.length) {
    const message = payload.errors?.map((error) => error.message).join("\n");
    throw new Error(message || "GraphQL request failed");
  }

  if (!payload.data) {
    throw new Error("GraphQL response missing data");
  }

  return payload.data;
}

export async function getMe(headers?: Record<string, string>) {
  try {
    const data = await executeGraphql(MeDocument, undefined, { headers });
    return data.me;
  } catch {
    return null;
  }
}

export type { MeQuery };
export { MeDocument };
