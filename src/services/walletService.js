import api from './api';

export const getMyBalance = () => api.get('/wallets/me');

export const topUp = (amount) =>
  api.post('/wallets/topup', { amount: String(amount) });

export const topUpBulk = (userIds, amount, isTopUpToCeiling = false) =>
  api.post('/wallets/topup/bulk', { userIds, amount: String(amount), isTopUpToCeiling });

export const getMyHistory = () => api.get('/wallets/history/me');

export const adminTopUp = (customerId, amount) =>
  api.post('/wallets/topup', { customerId, amount: String(amount) });

export const getEnterpriseHistory = () => api.get('/wallets/history/enterprise');
