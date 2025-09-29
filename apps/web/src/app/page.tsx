'use client';
import { HealthDocument, type HealthQuery, type HealthQueryVariables } from '@apptit/graphql';
import { useQuery } from '@apollo/client/react';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { z } from 'zod';

const HealthResponseSchema = z.object({
  health: z.string()
});

export default function HomePage() {
  const result = useQuery<HealthQuery, HealthQueryVariables>(
    HealthDocument as TypedDocumentNode<HealthQuery, HealthQueryVariables>
  );

  if (result.loading) return <p>Loading…</p>;
  if (result.error) return <p>Error: {result.error.message}</p>;

  if (!result.data) {
    return <p>API health: unavailable</p>;
  }

  const parsed = HealthResponseSchema.safeParse(result.data);
  if (!parsed.success) {
    return <p>API health: invalid response</p>;
  }

  return <p>API health: {parsed.data.health}</p>;
}
