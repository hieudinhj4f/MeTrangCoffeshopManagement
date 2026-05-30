import api from './api';

export const getWarehouses = () => api.get('/warehouses');

export const getWarehouse = (warehouseId) => api.get(`/warehouses/${warehouseId}`);

export const getWarehouseInventory = (warehouseId) =>
  api.get(`/warehouses/${warehouseId}/inventory`);

export const getWarehouseTransactions = (warehouseId) =>
  api.get(`/warehouses/${warehouseId}/transactions`);

export const importStock = (payload) => api.post('/warehouses/import', payload);
