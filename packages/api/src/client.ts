import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

type ClientOptions = {
  cookie?: string;
  endpoint?: string;
};

const defaultEndpoint =
  process.env.GRAPHQL_ENDPOINT ?? process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

const isServer = typeof globalThis === "undefined" || !("window" in globalThis);

export function createApolloClient(options: ClientOptions = {}) {
  const endpoint = options.endpoint ?? defaultEndpoint;

  if (!endpoint) {
    throw new Error("GraphQL endpoint is not configured");
  }

  return new ApolloClient({
    ssrMode: isServer,
    link: new HttpLink({
      uri: endpoint,
      headers: options.cookie ? { cookie: options.cookie } : undefined
    }),
    cache: new InMemoryCache()
  });
}
