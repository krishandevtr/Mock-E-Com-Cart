import express from 'express';
import axios from 'axios';
import { CartModel } from '../models/Cart';

const router = express.Router();

function userIdFrom(req: express.Request) {
  return (req.header('x-user-id') || 'demo').toString();
}

router.get('/cart', async (req, res) => {
  const userId = userIdFrom(req);
  const cart = await CartModel.findOne({ userId }).lean();
  const items = cart?.items || [];
  let total = 0;
  const detailed = [] as any[];
  for (const it of items) {
    try {
      const { data: p } = await axios.get(`${process.env.PRODUCT_SERVICE_URL || 'http://localhost:4001/api'}/products/${it.productId}`);
      const lineTotal = p.price * it.qty;
      total += lineTotal;
      detailed.push({ id: it._id, productId: it.productId, qty: it.qty, product: p, lineTotal });
    } catch (e) {
      // product missing - skip but keep cart integrity
    }
  }
  res.json({ items: detailed, total: Number(total.toFixed(2)) });
});

router.post('/cart', async (req, res) => {
  const userId = userIdFrom(req);
  const { productId, qty } = req.body as { productId: string; qty: number };
  if (!productId || !Number.isInteger(qty) || qty === 0) return res.status(400).json({ error: 'Invalid payload' });
  // validate product exists
  try {
    await axios.get(`${process.env.PRODUCT_SERVICE_URL || 'http://localhost:4001/api'}/products/${productId}`);
  } catch {
    return res.status(404).json({ error: 'Product not found' });
  }
  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    if (qty < 0) return res.status(400).json({ error: 'Cannot decrement non-existing cart item' });
    const created = await CartModel.create({ userId, items: [{ productId, qty }] });
    return res.status(201).json({ ok: true });
  }
  const existing = cart.items.find(i => i.productId === productId);
  if (!existing) {
    if (qty < 0) return res.status(400).json({ error: 'Cannot decrement non-existing item' });
    cart.items.push({ productId, qty });
  } else {
    existing.qty += qty;
    if (existing.qty <= 0) {
      cart.items = cart.items.filter(i => i.productId !== productId);
    }
  }
  await cart.save();
  res.status(201).json({ ok: true });
});

router.delete('/cart/:itemId', async (req, res) => {
  const userId = userIdFrom(req);
  const { itemId } = req.params;
  const cart = await CartModel.findOne({ userId });
  if (!cart) return res.status(404).json({ error: 'Cart not found' });
  const before = cart.items.length;
  cart.items = cart.items.filter(i => i._id?.toString() !== itemId);
  if (cart.items.length === before) return res.status(404).json({ error: 'Item not found' });
  await cart.save();
  res.json({ ok: true });
});

export default router;
