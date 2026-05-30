import React, { useState } from 'react';
import { quickAddProduct } from '../../services/productService';

const QuickAddProductModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('Cái');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await quickAddProduct({ name, sku, unit });
      onSave?.(res.data);
      setName('');
      setSku('');
      setUnit('Cái');
      onClose();
    } catch (err) {
      const message = err.response?.data?.reason || 'Không thể lưu vật phẩm. Vui lòng thử lại.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#111827]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
        <h3 className="text-slate-800 font-black uppercase tracking-tight mb-6">Đăng ký vật phẩm mới</h3>
        {error && <p className="text-red-500 text-xs font-medium mb-4">{error}</p>}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Tên vật phẩm</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Ví dụ: Syrup Đào Boduo..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Mã SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                placeholder="SY-DAO-01"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Đơn vị tính</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none"
              >
                <option>Cái</option>
                <option>Chai</option>
                <option>Kg</option>
                <option>Thùng</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-3 text-[10px] font-black uppercase text-slate-400">
            Bỏ qua
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase">
            {loading ? 'Đang lưu...' : 'Lưu vật phẩm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddProductModal;
