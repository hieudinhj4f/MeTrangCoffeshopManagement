import React, { useState } from 'react';
import { X, CalendarClock, Tag } from 'lucide-react';
import { message } from 'antd';
import api from "../../services/api.js";

export default function PriceConfigModal({ isOpen, onClose, product, onPriceAdded }) {
  const [priceType, setPriceType] = useState('REGULAR');
  const [formData, setFormData] = useState({
    price: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.price) return message.warning('Vui lòng nhập mức giá!');
    if (priceType === 'EVENT' && (!formData.startDate || !formData.endDate)) {
      return message.warning('Giá sự kiện phải có thời gian bắt đầu và kết thúc!');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        price: Number(formData.price),
        priceType: priceType,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        description: formData.description
      };

      await api.post(`/products/${product.id}/prices`, payload);
      message.success('Cập nhật cấu hình giá thành công!');
      onPriceAdded(); // Hàm refresh lại danh sách ngoài component cha
      onClose();
    } catch (error) {
      message.error(error.response?.data?.reason || 'Có lỗi xảy ra khi thiết lập giá!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white w-[500px] rounded-[32px] shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header Modal */}
        <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Cấu hình giá bán</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sản phẩm: {product.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-8">
          
          {/* Chọn Loại Giá */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div 
              onClick={() => setPriceType('REGULAR')}
              className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center transition-all ${priceType === 'REGULAR' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
            >
              <Tag size={20} className="mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest">Giá Thường</span>
            </div>
            <div 
              onClick={() => setPriceType('EVENT')}
              className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center transition-all ${priceType === 'EVENT' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
            >
              <CalendarClock size={20} className="mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sự kiện (Khuyến mãi)</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Nhập mức giá */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Mức giá áp dụng (VNĐ) <span className="text-red-500">*</span></label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none text-slate-700 focus:ring-2 focus:ring-orange-500/20" placeholder="Ví dụ: 35000" />
            </div>

            {/* Chọn thời gian */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                  Từ ngày {priceType === 'EVENT' && <span className="text-red-500">*</span>}
                </label>
                <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleInputChange} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-700 focus:ring-2 focus:ring-orange-500/20" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                  Đến ngày {priceType === 'EVENT' && <span className="text-red-500">*</span>}
                </label>
                <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleInputChange} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-700 focus:ring-2 focus:ring-orange-500/20" />
              </div>
            </div>

            {/* Ghi chú */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Tên sự kiện / Ghi chú</label>
              <input type="text" name="description" value={formData.description} onChange={handleInputChange} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-700 focus:ring-2 focus:ring-orange-500/20" placeholder="Ví dụ: Khuyến mãi tết âm lịch..." />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl border-2 border-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-2xl bg-[#111827] text-white font-black text-[10px] uppercase tracking-[2px] hover:bg-orange-500 transition-all disabled:opacity-50">
              {isSubmitting ? 'Đang lưu...' : 'Lưu Bảng Giá'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}