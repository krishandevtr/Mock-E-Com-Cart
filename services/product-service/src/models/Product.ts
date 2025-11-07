import mongoose, { Schema, model } from 'mongoose';

export interface Product {
  _id?: string;
  name: string;
  price: number;
  image?: string;
}

const ProductSchema = new Schema<Product>({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String }
}, { timestamps: true });

export const ProductModel = model<Product>('Product', ProductSchema);

export async function connect(dbUri: string) {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(dbUri);
  }
}
