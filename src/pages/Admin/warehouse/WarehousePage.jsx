import React, { useEffect, useState } from 'react';
import InventoryTab from './InventoryTab.jsx';
import TransactionTab from './TransactionTab.jsx';
import InvoiceTab from './InvoiceTab.jsx';
import { getWarehouses } from '../../../services/warehouseService.js';

const WarehousePage = ({ initialTab = 'inventory', warehouseId: initialWarehouseId }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(initialWarehouseId ?? null);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    getWarehouses()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setWarehouses(list);
        if (list.length > 0) {
          setSelectedWarehouse((current) => {
            if (current != null && list.some((w) => w.id === current)) return current;
            return list[0].id;
          });
        }
      })
      .catch((err) => console.error('Không tải được danh sách kho:', err))
      .finally(() => setLoadingWarehouses(false));
  }, []);

  const tabs = [
    { id: 'inventory', label: 'Tồn kho & Vật phẩm', icon: 'fa-boxes-stacked' },
    { id: 'transactions', label: 'Nhật ký Nhập/Xuất', icon: 'fa-exchange-alt' },
    { id: 'invoices', label: 'Hóa đơn & Chứng từ', icon: 'fa-file-invoice-dollar' },
  ];

  const activeWarehouse = warehouses.find((w) => w.id === selectedWarehouse);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-orange-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <i className={`fas ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {!loadingWarehouses && warehouses.length > 0 && (
          <div className="flex items-center gap-3">
            <label htmlFor="warehouse-select" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Kho đang xem
            </label>
            <select
              id="warehouse-select"
              value={selectedWarehouse ?? ''}
              onChange={(e) => setSelectedWarehouse(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}{w.isActive === false ? ' (Ngưng hoạt động)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeWarehouse && (
        <p className="text-[10px] text-slate-400 font-medium italic px-1">
          {activeWarehouse.address || 'Chưa cập nhật địa chỉ'}
        </p>
      )}

      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 min-h-[600px]">
        {loadingWarehouses ? (
          <p className="text-slate-400 text-xs font-medium italic text-center py-12">Đang tải thông tin kho...</p>
        ) : selectedWarehouse == null ? (
          <p className="text-slate-400 text-xs font-medium italic text-center py-12">Chưa có kho nào trong hệ thống.</p>
        ) : (
          <>
            {activeTab === 'inventory' && <InventoryTab warehouseId={selectedWarehouse} />}
            {activeTab === 'transactions' && <TransactionTab warehouseId={selectedWarehouse} />}
            {activeTab === 'invoices' && <InvoiceTab warehouseId={selectedWarehouse} />}
          </>
        )}
      </div>
    </div>
  );
};

export default WarehousePage;
