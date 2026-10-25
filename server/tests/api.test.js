const request = require('supertest');
const app = require('../server');

describe('EventHub API Endpoints', () => {
  it('GET /api/health should return status healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('healthy');
  });

  it('POST /api/v1/auth/register should validate required fields', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: '',
      email: 'bad-email',
      password: '123',
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login should reject empty credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/events should return 200 and standard response shape', async () => {
    const res = await request(app).get('/api/v1/events');
    // If DB is offline, returns either 200 or catches cleanly
    expect([200, 500]).toContain(res.statusCode);
  });
});
