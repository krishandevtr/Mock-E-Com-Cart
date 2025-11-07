import mongoose, { Schema, model } from 'mongoose';

export interface OrderItem {
  productId: string;
  qty: number;
  priceAtPurchase: number;
}
export interface Order {
  _id?: string;
  userId: string;
  name: string;
  email: string;
  items: OrderItem[];
  total: number;
  createdAt?: Date;
}

const OrderItemSchema = new Schema<OrderItem>({
  productId: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  priceAtPurchase: { type: Number, required: true, min: 0 }
});

const OrderSchema = new Schema<Order>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  items: { type: [OrderItemSchema], default: [] },
  total: { type: Number, required: true }
}, { timestamps: true });

export const OrderModel = model<Order>('Order', OrderSchema);

export async function connect(dbUri: string) {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(dbUri);
  }
}
