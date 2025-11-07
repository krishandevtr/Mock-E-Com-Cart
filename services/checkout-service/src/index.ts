import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { connect, OrderModel } from './models/Order';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

function userIdFrom(req: express.Request) {
  return (req.header('x-user-id') || 'demo').toString();
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/checkout', async (req, res) => {
  const userId = userIdFrom(req);
  const { cartItems, name, email } = req.body as { cartItems: { productId: string; qty: number }[]; name: string; email: string };
  if (!Array.isArray(cartItems) || cartItems.length === 0 || !name || !email) return res.status(400).json({ error: 'Invalid payload' });
  const productService = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4001/api';
  let total = 0;
  const items: { productId: string; qty: number; priceAtPurchase: number }[] = [];
  for (const it of cartItems) {
    const { data: p } = await axios.get(`${productService}/products/${it.productId}`);
    const line = { productId: it.productId, qty: it.qty, priceAtPurchase: p.price };
    total += p.price * it.qty;
    items.push(line);
  }
  const order = await OrderModel.create({ userId, name, email, items, total: Number(total.toFixed(2)) });
  res.status(201).json({ id: order._id, total: order.total, timestamp: order.createdAt });
});

const PORT = Number(process.env.PORT || 4003);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibe_cart';

(async () => {
  await connect(MONGODB_URI);
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`checkout-service listening on ${PORT}`));
  }
})();

export default app;
