import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

export type Product = { _id: string; name: string; price: number; image?: string };
export type CartItem = { id: string; productId: string; qty: number; product: Product; lineTotal: number };
export type Cart = { items: CartItem[]; total: number };
