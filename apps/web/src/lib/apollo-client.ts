'use client';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export function makeClient(): ApolloClient<object> {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_API_BASE_URL
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '')}/graphql`
        : 'http://localhost:4000/graphql',
      credentials: 'include'
    }),
    cache: new InMemoryCache(),
    connectToDevTools: process.env.NODE_ENV !== 'production'
  });
}
