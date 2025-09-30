'use client';
import { ApolloClient, HttpLink, InMemoryCache, type NormalizedCacheObject } from '@apollo/client/core';

export function makeClient(): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_API_BASE_URL
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '')}/graphql`
        : 'http://localhost:4000/graphql',
      credentials: 'include'
    }),
    cache: new InMemoryCache()
  });
}
