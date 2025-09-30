import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { graphql, GraphQLSchema } from 'graphql';
import { z } from 'zod';

import { AppModule } from '../../api/src/app.module';

const ProductsResponseSchema = z.object({
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      sku: z.string(),
      price: z.number()
    })
  )
});

describe('Products query (e2e)', () => {
  let app: INestApplication;
  let schema: GraphQLSchema;

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

  it('returns sample products from the GraphQL API', async () => {
    const result = await graphql({
      schema,
      source: `
        query Products {
          products {
            id
            name
            sku
            price
          }
        }
      `
    });

    expect(result.errors).toBeUndefined();
    const data = ProductsResponseSchema.parse(result.data);
    expect(data.products.length).toBeGreaterThan(0);
  });
});
