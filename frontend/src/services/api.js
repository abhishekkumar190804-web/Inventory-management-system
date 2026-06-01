import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://inventrack-backend-ujyy.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message || 'Something went wrong';
    toast.error(msg);
    return Promise.reject(err);
  }
);

export const getDashboard = () => api.get('/dashboard').then((r) => r.data);

export const getProducts = () => api.get('/products').then((r) => r.data);
export const getProduct = (id) => api.get(`/products/${id}`).then((r) => r.data);
export const createProduct = (data) => api.post('/products', data).then((r) => r.data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data).then((r) => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);

export const getCustomers = () => api.get('/customers').then((r) => r.data);
export const createCustomer = (data) => api.post('/customers', data).then((r) => r.data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`).then((r) => r.data);

export const getOrders = () => api.get('/orders').then((r) => r.data);
export const getOrder = (id) => api.get(`/orders/${id}`).then((r) => r.data);
export const createOrder = (data) => api.post('/orders', data).then((r) => r.data);
export const cancelOrder = (id) => api.delete(`/orders/${id}`).then((r) => r.data);
