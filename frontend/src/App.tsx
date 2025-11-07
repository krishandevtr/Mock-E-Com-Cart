import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { api, Product, Cart } from './api';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [receipt, setReceipt] = useState<{ id: string; total: number; timestamp: string } | null>(null);

  async function refresh() {
    const [p, c] = await Promise.all([
      api.get<Product[]>('/products'),
      api.get<Cart>('/cart')
    ]);
    setProducts(p.data);
    setCart(c.data);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function addToCart(productId: string, delta = 1) {
    await api.post('/cart', { productId, qty: delta });
    await refresh();
  }
  async function removeItem(itemId: string) {
    await api.delete(`/cart/${itemId}`);
    await refresh();
  }
  async function checkout() {
    if (!name || !email) return alert('Enter name and email');
    const payload = { name, email, cartItems: cart.items.map(i => ({ productId: i.productId, qty: i.qty })) };
    const res = await api.post('/checkout', payload);
    setReceipt(res.data);
  }

  const gridCols = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem'
  }) as React.CSSProperties, []);

  return (
    <div style={{ padding: 16, maxWidth: 1000, margin: '0 auto' }}>
      <h1>Vibe Commerce - Mock Cart</h1>
      <div style={gridCols}>
        {products.map(p => (
          <div key={p._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div>${p.price.toFixed(2)}</div>
            <button onClick={() => addToCart(p._id, 1)} style={{ marginTop: 8 }}>Add to Cart</button>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 24 }}>Cart</h2>
      {cart.items.length === 0 ? (
        <div>Cart is empty</div>
      ) : (
        <div>
          {cart.items.map(i => (
            <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ flex: 1 }}>{i.product.name}</div>
              <div>${i.product.price.toFixed(2)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => addToCart(i.productId, -1)}>-</button>
                <span>{i.qty}</span>
                <button onClick={() => addToCart(i.productId, 1)}>+</button>
              </div>
              <div style={{ width: 80, textAlign: 'right' }}>${i.lineTotal.toFixed(2)}</div>
              <button onClick={() => removeItem(i.id)}>Remove</button>
            </div>
          ))}
          <div style={{ textAlign: 'right', fontWeight: 700, marginTop: 8 }}>Total: ${cart.total.toFixed(2)}</div>
        </div>
      )}

      <h2 style={{ marginTop: 24 }}>Checkout</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <button onClick={checkout} disabled={cart.items.length === 0}>Submit</button>
      </div>

      {receipt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setReceipt(null)}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 8, minWidth: 300 }} onClick={e => e.stopPropagation()}>
            <h3>Receipt</h3>
            <div>Total: ${receipt.total.toFixed(2)}</div>
            <div>Time: {new Date(receipt.timestamp).toLocaleString()}</div>
            <button style={{ marginTop: 12 }} onClick={() => setReceipt(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
