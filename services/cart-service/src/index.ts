import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect } from './models/Cart';
import cartRouter from './routes/cart';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', cartRouter);

const PORT = Number(process.env.PORT || 4002);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibe_cart';

(async () => {
  await connect(MONGODB_URI);
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`cart-service listening on ${PORT}`));
  }
})();

export default app;
