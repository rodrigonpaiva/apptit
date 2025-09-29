import supertest, { SuperTest, Test } from 'supertest';

describe('API healthcheck', () => {
  it('responds with a healthy status', async () => {
    const api: SuperTest<Test> = supertest('http://localhost:4000');
    const response = await api.get('/health');
    expect(response.status).toBe(200);
  });
});
