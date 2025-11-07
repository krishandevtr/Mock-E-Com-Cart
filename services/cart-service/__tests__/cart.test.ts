import request from 'supertest';
import app from '../src/index';
import { connect, CartModel } from '../src/models/Cart';

jest.mock('axios', () => ({
  get: jest.fn(async (url) => {
    // return a dummy product with id extracted from URL
    const id = url.toString().split('/').pop();
    return { data: { _id: id, name: 'Mock', price: 10 } };
  })
}));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibe_cart';

describe('cart-service', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connect(MONGODB_URI);
  });

  beforeEach(async () => {
    await CartModel.deleteMany({ userId: 'demo' });
  });

  it('adds item and computes total', async () => {
    const productId = 'p1';
    const add = await request(app).post('/api/cart').send({ productId, qty: 2 });
    expect(add.status).toBe(201);
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(20);
    expect(res.body.items[0].qty).toBe(2);
  });
});
