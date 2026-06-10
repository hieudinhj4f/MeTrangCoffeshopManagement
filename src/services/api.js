import axios from 'axios';

const api = axios.create({
  baseURL: 'https://metrangcompanybe.onrender.com/api',
});

// Interceptor để tự động gắn Token vào Header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('customerId');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const getProductPrice = (product) =>
  Number(product?.basePrice ?? product?.price ?? 0);