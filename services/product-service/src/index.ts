import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect, ProductModel } from './models/Product';
import productsRouter from './routes/products';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', productsRouter);

const PORT = Number(process.env.PORT || 4001);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibe_cart';

async function seed() {
  const count = await ProductModel.countDocuments();
  if (count === 0) {
    await ProductModel.insertMany([
      { name: 'Vibe Tee', price: 19.99, image: '' },
      { name: 'Vibe Hoodie', price: 49.99, image: '' },
      { name: 'Vibe Mug', price: 9.99, image: '' },
      { name: 'Vibe Cap', price: 14.99, image: '' },
      { name: 'Vibe Stickers', price: 4.99, image: '' },
      { name: 'Vibe Socks', price: 7.99, image: '' }
    ]);
  }
}

(async () => {
  await connect(MONGODB_URI);
  await seed();
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`product-service listening on ${PORT}`));
  }
})();

export default app;
