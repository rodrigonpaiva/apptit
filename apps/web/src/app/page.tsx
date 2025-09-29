/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
'use client';
import type { DocumentNode } from 'graphql';
import { documents } from '@apptit/graphql';
import { useQuery } from '@apollo/client';

type HealthQueryResult = { health: string };

type HealthQueryVariables = Record<string, never>;

const typedDocuments = documents as {
  HealthDocument: DocumentNode<HealthQueryResult, HealthQueryVariables>;
};

export default function HomePage() {
  const { data, loading, error } = useQuery<HealthQueryResult, HealthQueryVariables>(
    typedDocuments.HealthDocument
  );

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error.message}</p>;
  return <p>API health: {data?.health}</p>;
}
