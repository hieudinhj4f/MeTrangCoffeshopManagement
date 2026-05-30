import React, { useEffect, useState } from 'react';
import { getWarehouseInventory } from '../../../services/warehouseService';

const InventoryTab = ({ warehouseId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!warehouseId) return;

    setLoading(true);
    setError(null);

    getWarehouseInventory(warehouseId)
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error(err);
        setError('Không thể tải dữ liệu tồn kho. Vui lòng kiểm tra kết nối backend.');
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [warehouseId]);

  const rowKey = (item) =>
    `${item.id?.warehouseId ?? warehouseId}-${item.id?.productId ?? item.product?.id}`;

  if (loading) {
    return <p className="text-slate-400 text-xs font-medium italic py-8 text-center">Đang tải tồn kho...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-xs font-medium py-8 text-center">{error}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-slate-800 font-black text-lg uppercase tracking-tight">Danh mục vật phẩm</h3>
          <p className="text-slate-400 text-[10px] font-medium italic">Quản lý nguyên liệu và vật tư tiêu hao trong kho.</p>
        </div>
        <button className="bg-[#111827] text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-500 transition-colors">
          <i className="fas fa-plus mr-2"></i> Kiểm kê thủ công
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-slate-400 text-xs font-medium italic py-12 text-center">Kho hiện chưa có sản phẩm nào.</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-slate-100">
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Số lượng</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn vị</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hạn dùng</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <tr key={rowKey(item)} className="group hover:bg-slate-50/50 transition-all">
                <td className="py-5">
                  <div className="flex items-center gap-4">
                    {/* Ô tròn hiển thị ảnh bóc từ link Cloudinary trong DB ra */}
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product?.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=Mê+Trang'; }} />
                      ) : (
                        <div className="text-slate-400 text-xs font-black uppercase">{item.product?.name ? item.product.name.slice(0, 2) : 'VT'}</div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{item.product?.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium tracking-wider mt-0.5">SKU: {item.product?.sku || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-5 text-center font-black text-slate-700 text-sm">{item.quantity}</td>
                <td className="py-5 text-[11px] font-bold text-slate-500 uppercase">{item.product?.unit || 'Cái'}</td>
                <td className="py-5 text-[11px] text-slate-500">{item.expiryDate || '—'}</td>
                <td className="py-5">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${item.quantity > 10 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{item.quantity > 10 ? 'An toàn' : 'Sắp hết hàng'}</span>
                </td>
                <td className="py-5 text-right">
                  <button type="button" className="text-slate-300 hover:text-orange-500 p-2"><i className="fas fa-pen text-xs"></i></button>
                  <button type="button" className="text-slate-300 hover:text-red-500 p-2"><i className="fas fa-trash-alt text-xs"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InventoryTab;