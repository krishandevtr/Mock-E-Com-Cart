import request from 'supertest';
import app from '../src/index';
import { connect, ProductModel } from '../src/models/Product';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibe_cart';

describe('product-service', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connect(MONGODB_URI);
    const count = await ProductModel.countDocuments();
    if (count < 5) {
      await ProductModel.insertMany([
        { name: 'A', price: 1 }, { name: 'B', price: 2 }, { name: 'C', price: 3 }, { name: 'D', price: 4 }, { name: 'E', price: 5 }
      ]);
    }
  });

  it('lists products (>=5)', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
  });
});
