import React, { useState, useEffect } from 'react';
import api from '../../../services/api.js';
import { message } from 'antd';
import { Building2, Search, Plus, Edit2, X, Receipt, Phone, MapPin } from 'lucide-react';

export default function B2BManager() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    taxCode: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    billingAddress: '',
    b2bDiscountRate: 0
  });

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers/b2b');
      setPartners(res.data);
    } catch (error) {
      message.error(error.response?.data?.reason || 'Lỗi tải danh sách đối tác');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const openModal = (partner = null) => {
    if (partner) {
      setEditingId(partner.id);
      setFormData({
        companyName: partner.companyName || '',
        taxCode: partner.taxCode || '',
        fullName: partner.fullName || '',
        phoneNumber: partner.phoneNumber || '',
        email: partner.email || '',
        billingAddress: partner.billingAddress || '',
        b2bDiscountRate: partner.b2bDiscountRate || 0,
        creditLimit: partner.creditLimit || 50000000
      });
    } else {
      setEditingId(null);
      setFormData({ companyName: '', taxCode: '', fullName: '', phoneNumber: '', email: '', billingAddress: '', b2bDiscountRate: 0, creditLimit: 50000000 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.taxCode || !formData.billingAddress) {
      message.warning('Vui lòng nhập Tên công ty, Mã số thuế và Địa chỉ xuất hóa đơn!');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/customers/b2b/${editingId}`, formData);
        message.success('Cập nhật hồ sơ thành công!');
      } else {
        await api.post('/customers/b2b', formData);
        message.success('Thêm đối tác B2B mới thành công!');
      }
      closeModal();
      fetchPartners();
    } catch (error) {
      message.error(error.response?.data?.reason || 'Có lỗi xảy ra khi lưu');
    }
  };

  const filteredPartners = partners.filter(p => 
    (p.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.taxCode || '').includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 animate-in fade-in duration-500 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Khách Hàng Doanh Nghiệp</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[2px] mt-1">Quản lý hồ sơ B2B & Xuất hóa đơn VAT</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100 w-72">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 ml-3 placeholder-slate-400 w-full" 
              placeholder="Tìm tên công ty, mã số thuế..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => openModal()}
            className="px-8 py-3 rounded-2xl bg-[#111827] text-white font-black text-[10px] uppercase tracking-[2px] hover:bg-orange-500 transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Thêm Đối Tác
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b-2 border-slate-100 text-slate-400 uppercase font-black">
                <th className="pb-4 font-black uppercase text-slate-400 text-left px-2">Hồ Sơ Doanh Nghiệp</th>
                <th className="pb-4 font-black uppercase text-slate-400 text-left px-2">MST</th>
                <th className="pb-4 font-black uppercase text-slate-400 text-left px-2">Người Đại Diện</th>
                <th className="pb-4 font-black uppercase text-slate-400 text-center px-2">Chiết Khấu</th>
                <th className="pb-4 font-black uppercase text-slate-400 text-left px-2">Hạn mức Nợ</th>
                <th className="pb-4 font-black uppercase text-slate-400 text-right px-2">Đã Chi Tiêu</th>
                <th className="pb-4 font-black uppercase text-slate-400 text-right px-2 w-16">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredPartners.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  Chưa có đối tác nào.
                </td>
              </tr>
            ) : (
              filteredPartners.map(partner => (
                <tr key={partner.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{partner.companyName}</div>
                        <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin size={10} /> {partner.billingAddress || 'Chưa cập nhật địa chỉ'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-black text-[10px] tracking-wider flex items-center gap-1.5 w-max">
                      <Receipt size={12} /> {partner.taxCode}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="font-bold text-slate-700">{partner.fullName || '—'}</div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
                      <Phone size={10} /> {partner.phoneNumber || '—'}
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center font-bold text-slate-600 text-xs">
                    {partner.b2bDiscountRate ? `${partner.b2bDiscountRate}%` : '—'}
                  </td>
                  <td className="py-4 px-4 font-semibold text-red-500">
                    {(partner.creditLimit || 0).toLocaleString()} đ
                  </td>
                  <td className="py-4 px-2 text-right font-black text-orange-500 text-xs">
                    {partner.totalSpent ? partner.totalSpent.toLocaleString('vi-VN') : 0} đ
                  </td>
                  <td className="py-4 px-2 text-right">
                    <button 
                      onClick={() => openModal(partner)} 
                      className="text-slate-400 hover:text-orange-500 p-2 rounded-lg hover:bg-orange-50 transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tailwind */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-[600px] rounded-[32px] shadow-2xl overflow-hidden border border-slate-100">
            
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
                {editingId ? 'Cập Nhật Đối Tác' : 'Thêm Đối Tác B2B'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-all">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-8 grid grid-cols-2 gap-6">
                <div className="col-span-2 flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Tên Doanh Nghiệp (Pháp nhân) <span className="text-red-500">*</span></label>
                  <input required name="companyName" value={formData.companyName} onChange={handleInputChange} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-700 focus:ring-2 focus:ring-orange-500/20" placeholder="Công ty TNHH Mê Trang..." />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Mã Số Thuế <span className="text-red-500">*</span></label>
                  <input required name="taxCode" value={formData.taxCode} onChange={handleInputChange} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-700 focus:ring-2 focus:ring-orange-500/20" placeholder="0101234567" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Người Đại Diện</label>
                  <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-700 focus:ring-2 focus:ring-orange-500/20" placeholder="Nguyễn Văn A" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Số Điện Thoại</label>
                  <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-700 focus:ring-2 focus:ring-orange-500/20" placeholder="090..." />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Email Hợp Đồng</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-700 focus:ring-2 focus:ring-orange-500/20" placeholder="contact@company.com" />
                </div>

                <div className="col-span-2 flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Địa Chỉ Xuất Hóa Đơn <span className="text-red-500">*</span></label>
                  <input required name="billingAddress" value={formData.billingAddress} onChange={handleInputChange} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-700 focus:ring-2 focus:ring-orange-500/20" placeholder="Tầng 1, Tòa nhà X..." />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Chiết Khấu Đàm Phán (%)</label>
                  <input type="number" step="0.1" min="0" max="100" name="b2bDiscountRate" value={formData.b2bDiscountRate} onChange={handleInputChange} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-700 focus:ring-2 focus:ring-orange-500/20" placeholder="15" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-2 ml-1">Hạn mức Nợ (VND)</label>
                  <input type="number" step="100000" min="0" name="creditLimit" value={formData.creditLimit} onChange={handleInputChange} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-700 focus:ring-2 focus:ring-orange-500/20" placeholder="50000000" />
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50/50 flex justify-end gap-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-8 py-3 rounded-2xl border-2 border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                  Hủy
                </button>
                <button type="submit" className="px-10 py-3 rounded-2xl bg-[#111827] text-white font-black text-[10px] uppercase tracking-[2px] hover:bg-orange-500 transition-all">
                  {editingId ? 'Xác nhận Lưu' : 'Tạo Hồ Sơ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}