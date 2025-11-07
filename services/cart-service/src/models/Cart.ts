import mongoose, { Schema, model, Types } from 'mongoose';

export interface CartItem {
  _id?: Types.ObjectId;
  productId: string;
  qty: number;
}
export interface Cart {
  _id?: string;
  userId: string;
  items: CartItem[];
}

const CartItemSchema = new Schema<CartItem>({
  productId: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 }
});

const CartSchema = new Schema<Cart>({
  userId: { type: String, required: true, index: true },
  items: { type: [CartItemSchema], default: [] }
}, { timestamps: true });

export const CartModel = model<Cart>('Cart', CartSchema);

export async function connect(dbUri: string) {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(dbUri);
  }
}
