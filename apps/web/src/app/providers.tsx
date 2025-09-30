'use client';
import { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client/react';

import { makeClient } from '@/lib/apollo-client';

export default function Providers({ children }: { children: ReactNode }) {
  const client = makeClient();
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
