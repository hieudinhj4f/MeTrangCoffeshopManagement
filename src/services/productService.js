import api from './api';

export const getProducts = () => api.get('/products');

export const getActiveProducts = () => api.get('/products/active');

export const getProductById = (id) => api.get(`/products/${id}`);

export const quickAddProduct = (payload) => api.post('/products/quick-add', payload);
