import request from 'supertest';
import app from '../src/index';
import { connect, OrderModel } from '../src/models/Order';

jest.mock('axios', () => ({
  get: jest.fn(async (url) => {
    const id = url.toString().split('/').pop();
    return { data: { _id: id, name: 'Mock', price: 12.5 } };
  })
}));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibe_cart';

describe('checkout-service', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connect(MONGODB_URI);
  });

  beforeEach(async () => {
    await OrderModel.deleteMany({ userId: 'demo' });
  });

  it('creates receipt with total', async () => {
    const res = await request(app).post('/api/checkout').send({
      name: 'Test',
      email: 't@example.com',
      cartItems: [{ productId: 'p1', qty: 3 }]
    });
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(37.5);
    expect(res.body.timestamp).toBeTruthy();
  });
});
