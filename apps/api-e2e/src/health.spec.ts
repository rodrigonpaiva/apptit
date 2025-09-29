import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'http';
import request from 'supertest';
import { z } from 'zod';
import { AppModule } from '../../api/src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;
  const HealthResponseSchema = z.object({
    data: z.object({
      health: z.string()
    })
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns ok from /graphql health query', async () => {
    const response = await request(app.getHttpServer() as unknown as Server)
      .post('/graphql')
      .send({ query: 'query { health }' });

    expect(response.status).toBe(200);
    const parsed = HealthResponseSchema.parse(response.body);
    expect(parsed.data.health).toBe('ok');
  });
});
