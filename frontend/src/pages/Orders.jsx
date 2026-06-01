import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getOrders, getOrder, createOrder, cancelOrder, getProducts, getCustomers } from '../services/api';

const statusBadge = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
};

function CreateOrderModal({ onClose, onSave }) {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {});
    getCustomers().then(setCustomers).catch(() => {});
  }, []);

  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === parseInt(item.product_id));
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const handleItemChange = (idx, field, value) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);

  const removeItem = (idx) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }
    const payload = {
      customer_id: parseInt(customerId),
      items: items.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity, 10),
      })),
    };
    try {
      const created = await createOrder(payload);
      toast.success('Order created');
      onSave(created);
      onClose();
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || 'Something went wrong';
      toast.error(msg);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2>Create Order</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Customer</label>
              <select className="form-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Order Items
              </label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Product</label>
                  <select className="form-input" value={item.product_id} onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)} required>
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.price.toFixed(2)}) — Stock: {p.quantity}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ width: 100 }}>
                  <label>Qty</label>
                  <input className="form-input" type="number" min="1" value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} required />
                </div>
                <button type="button" className="btn-icon" onClick={() => removeItem(idx)} style={{ marginBottom: '0.375rem' }}>✕</button>
              </div>
            ))}

            <div style={{ textAlign: 'right', fontFamily: "'Space Mono', monospace", fontSize: '1.125rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              Total: <span style={{ color: 'var(--accent)' }}>${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Order</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderDetailModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) getOrder(orderId).then(setOrder).catch(() => {});
  }, [orderId]);

  if (!order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2>Order #{order.id}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'var(--text-muted)' }}>CUSTOMER</div>
              <div>{order.customer?.full_name}</div>
              <div className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{order.customer?.email}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'var(--text-muted)' }}>STATUS</div>
              <span className={`badge ${statusBadge[order.status]}`}>{order.status}</span>
            </div>
          </div>

          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ITEMS</div>
          {order.items.map((item) => (
            <div key={item.id} className="order-item-row">
              <div>
                <div>{item.product?.name || `Product #${item.product_id}`}</div>
                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ${item.unit_price.toFixed(2)} × {item.quantity}
                </div>
              </div>
              <div className="item-total">${(item.unit_price * item.quantity).toFixed(2)}</div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.875rem' }}>TOTAL</span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.125rem', color: 'var(--accent)' }}>
              ${order.total_amount.toFixed(2)}
            </span>
          </div>

          <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Created: {new Date(order.created_at).toLocaleString()}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function CancelConfirm({ order, onClose, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Cancel Order</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to cancel <strong>Order #{order.id}</strong>?</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            Stock will be restored to the products.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Keep Order</button>
          <button className="btn btn-danger" onClick={() => onConfirm(order.id)}>Cancel Order</button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const load = () => getOrders().then(setOrders).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    try {
      await cancelOrder(id);
      toast.success('Order cancelled — stock restored');
      setCancelTarget(null);
      load();
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || 'Something went wrong';
      toast.error(msg);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Order</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="mono">#{o.id}</td>
                  <td>{o.customer?.full_name || `ID ${o.customer_id}`}</td>
                  <td>{o.items?.length || 0}</td>
                  <td className="mono">${o.total_amount.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${statusBadge[o.status] || 'badge-info'}`}>{o.status}</span>
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" style={{ marginRight: '0.5rem' }}
                      onClick={() => setDetailId(o.id)}>View</button>
                    {o.status !== 'cancelled' && (
                      <button className="btn btn-danger btn-sm"
                        onClick={() => setCancelTarget(o)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && <CreateOrderModal onClose={() => setShowCreate(false)} onSave={load} />}
      {detailId && <OrderDetailModal orderId={detailId} onClose={() => setDetailId(null)} />}
      {cancelTarget && (
        <CancelConfirm order={cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancel} />
      )}
    </div>
  );
}
