import { useState, useEffect } from 'react';
import { getDashboard } from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getDashboard().then(setData).catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your inventory</p>
        </div>
      </div>

      <div className="status-indicator">
        <div className="status-dot" />
        <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          SYSTEM ONLINE
        </span>
      </div>

      <div className="card-grid">
        <div className="stat-card">
          <span className="stat-label">Total Products</span>
          <span className="stat-value accent">{data.total_products}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Customers</span>
          <span className="stat-value">{data.total_customers}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{data.total_orders}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Low Stock Items</span>
          <span className="stat-value" style={{ color: data.low_stock_products.length > 0 ? 'var(--warning)' : 'var(--success)' }}>
            {data.low_stock_products.length}
          </span>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Low Stock Products
        </h2>
        {data.low_stock_products.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            All products are well-stocked.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td className="mono">{p.sku}</td>
                    <td>{p.quantity}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {p.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
