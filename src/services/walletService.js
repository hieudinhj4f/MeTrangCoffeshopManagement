import api from './api';

export const getMyBalance = () => api.get('/wallets/me');

export const topUp = (amount) =>
  api.post('/wallets/topup', { amount: String(amount) });

export const topUpBulk = (userIds, amount) =>
  api.post('/wallets/topup/bulk', { userIds, amount: String(amount) });

export const getMyHistory = () => api.get('/wallets/history/me');

export const getEnterpriseHistory = () => api.get('/wallets/history/enterprise');
