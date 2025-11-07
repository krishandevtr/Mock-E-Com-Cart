import express from 'express';
import { ProductModel } from '../models/Product';

const router = express.Router();

router.get('/products', async (_req, res) => {
  const products = await ProductModel.find({}).lean();
  res.json(products);
});

router.get('/products/:id', async (req, res) => {
  const p = await ProductModel.findById(req.params.id).lean();
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

export default router;
