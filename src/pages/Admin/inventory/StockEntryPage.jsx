import React, { useState } from 'react';
import QuickAddProductModal from '../../../components/warehouse/QuickAddProductModal.jsx';

const StockEntryPage = () => {
  // 1. KHAI BÁO STATE (Sửa lỗi thiếu biến điều khiển Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState([{ id: 1, name: '', code: '', unit: '', qtyDoc: 0, qtyReal: 0, price: 0, total: 0 }]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', code: '', unit: '', qtyDoc: 0, qtyReal: 0, price: 0, total: 0 }]);
  };

  const handleInputChange = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    // Tự động tính Thành tiền
    if (field === 'qtyReal' || field === 'price') {
      newItems[idx].total = Number(newItems[idx].qtyReal) * Number(newItems[idx].price);
    }
    setItems(newItems);
  };

  const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 animate-in fade-in duration-500">
      {/* Header Phiếu */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Tạo Phiếu Nhập Kho</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[2px] mt-1">Mẫu số: 01 - VT (TT 200/2014/TT-BTC)</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[10px] font-bold text-slate-500">Số: <input type="text" className="border-b border-slate-200 outline-none w-20 text-orange-500" placeholder="NK-001"/></p>
          <p className="text-[10px] font-bold text-slate-500">Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      {/* Thông tin chung */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Người giao hàng</label>
            <input type="text" className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none" placeholder="Họ và tên..."/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Nhập tại kho</label>
            <select className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none">
              <option>Kho Tổng Mê Trang - Nha Trang</option>
            </select>
          </div>
        </div>
        <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng giá trị phiếu</p>
            <p className="text-3xl font-black text-orange-500">{grandTotal.toLocaleString()} đ</p>
        </div>
      </div>

      {/* Bảng nhập vật phẩm */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b-2 border-slate-100 text-slate-400 uppercase font-black">
              <th className="pb-4 text-left px-2">Tên vật phẩm</th>
              <th className="pb-4 text-center px-2 w-20">Mã số</th>
              <th className="pb-4 text-center px-2 w-16">ĐVT</th>
              <th className="pb-4 text-center px-2 w-20">Thực nhập</th>
              <th className="pb-4 text-right px-2 w-24">Đơn giá</th>
              <th className="pb-4 text-right px-2 w-28">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td className="py-3 px-2">
                  <input 
                    type="text" 
                    className="w-full bg-transparent outline-none font-bold text-slate-700" 
                    placeholder="Nhập tên..."
                    onChange={(e) => handleInputChange(idx, 'name', e.target.value)}
                  />
                </td>
                <td className="py-3 px-2 text-center text-slate-400">{item.code || '---'}</td>
                <td className="py-3 px-2 text-center">{item.unit || '---'}</td>
                <td className="py-3 px-2 text-center">
                  <input 
                    type="number" 
                    className="w-full text-center bg-transparent outline-none font-black text-orange-500" 
                    value={item.qtyReal}
                    onChange={(e) => handleInputChange(idx, 'qtyReal', e.target.value)}
                  />
                </td>
                <td className="py-3 px-2 text-right">
                  <input 
                    type="number" 
                    className="w-full text-right bg-transparent outline-none" 
                    value={item.price}
                    onChange={(e) => handleInputChange(idx, 'price', e.target.value)}
                  />
                </td>
                <td className="py-3 px-2 text-right font-black text-slate-800">
                  {(item.total || 0).toLocaleString()} đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center border-t border-slate-100 pt-8">
        <div className="flex gap-4">
            <button onClick={addItem} className="text-slate-400 hover:text-orange-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-plus-circle"></i> Thêm dòng
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
            >
              <i className="fas fa-magic"></i> Đăng ký vật phẩm mới
            </button>
        </div>

        <div className="flex gap-4">
          <button className="px-8 py-3 rounded-2xl border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest">Hủy</button>
          <button className="px-10 py-4 rounded-2xl bg-[#111827] text-white font-black text-[10px] uppercase tracking-[2px] hover:bg-orange-500 transition-all">
            Xác nhận & In
          </button>
        </div>
      </div>

      <QuickAddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={(newProduct) => {
           setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default StockEntryPage;