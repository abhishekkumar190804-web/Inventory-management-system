import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

const emptyForm = { name: '', sku: '', price: '', quantity: '', description: '' };

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        price: product.price?.toString() || '',
        quantity: product.quantity?.toString() || '',
        description: product.description || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [product]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
    };
    try {
      if (product) {
        const updated = await updateProduct(product.id, payload);
        toast.success('Product updated');
        onSave(updated);
      } else {
        const created = await createProduct(payload);
        toast.success('Product created');
        onSave(created);
      }
      onClose();
    } catch {}
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Name</label>
              <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input className="form-input mono" name="sku" value={form.sku} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input className="form-input" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input className="form-input" name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-input" name="description" value={form.description} onChange={handleChange} rows={3} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{product ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ product, onClose, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Delete Product</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete <strong>{product.name}</strong>?</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={() => onConfirm(product.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => getProducts().then(setProducts).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      load();
    } catch {}
  };

  const stockClass = (qty) => {
    if (qty === 0) return 'out';
    if (qty <= 10) return 'low';
    return 'ok';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ product: null })}>+ Add Product</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="mono">{p.sku}</td>
                  <td className="mono">${p.price.toFixed(2)}</td>
                  <td>
                    <span className={`stock-dot ${stockClass(p.quantity)}`} />
                    {p.quantity}
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" style={{ marginRight: '0.5rem' }} onClick={() => setModal({ product: p })}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(p)}>Del</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No products yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <ProductModal
          product={modal.product}
          onClose={() => setModal(null)}
          onSave={() => load()}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
