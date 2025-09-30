import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { graphql, GraphQLSchema } from 'graphql';
import { z } from 'zod';

import { AppModule } from '../../api/src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;
  let schema: GraphQLSchema;
  const HealthResponseSchema = z.object({
    health: z.string()
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const schemaHost = app.get(GraphQLSchemaHost);
    schema = schemaHost.schema;
  });

  afterAll(async () => {
    await app.close();
  });

  it('resolves health query', async () => {
    const result = await graphql({ schema, source: 'query { health }' });
    expect(result.errors).toBeUndefined();
    const payload = HealthResponseSchema.parse(result.data);
    expect(payload.health).toBe('ok');
  });
});
