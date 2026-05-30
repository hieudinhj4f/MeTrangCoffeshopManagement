import api from './api';

export const placeOrder = (payload) => api.post('/orders/place', payload);

export const cancelOrder = (orderId) => api.post(`/orders/${orderId}/cancel`);

export const getOrders = () => api.get('/orders');

export const getMyOrders = () => api.get('/orders/my-orders');

export const updateOrderStatus = (orderId, status) =>
  api.patch(`/orders/${orderId}/status`, { status });
