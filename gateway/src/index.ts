import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
app.use(cors());

app.get('/health', (_req, res) => res.json({ ok: true }));

const productTarget = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4001';
const cartTarget = process.env.CART_SERVICE_URL || 'http://localhost:4002';
const checkoutTarget = process.env.CHECKOUT_SERVICE_URL || 'http://localhost:4003';

// Products
app.use('/api/products', createProxyMiddleware({ target: productTarget, changeOrigin: true, proxyTimeout: 10000, timeout: 10000 }));
// Cart
app.use('/api/cart', createProxyMiddleware({ target: cartTarget, changeOrigin: true, proxyTimeout: 10000, timeout: 10000 }));
// Checkout
app.use('/api/checkout', createProxyMiddleware({ target: checkoutTarget, changeOrigin: true, proxyTimeout: 10000, timeout: 10000 }));

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => console.log(`api-gateway listening on ${PORT}`));
