import React, { useState, useEffect } from 'react';
import { message, Modal, Input, Button } from 'antd';
import dayjs from 'dayjs';
import api from '../../../services/api';

const InvoiceTab = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [eInvoiceNumber, setEInvoiceNumber] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openIssueModal = (inv) => {
    setSelectedInvoice(inv);
    setEInvoiceNumber('');
    setIsModalOpen(true);
  };

  const handleIssueInvoice = async () => {
    if (!eInvoiceNumber) {
      message.warning('Vui lòng nhập số hóa đơn điện tử');
      return;
    }
    try {
      await api.post(`/invoices/${selectedInvoice.id}/issue`, { eInvoiceNumber });
      message.success('Đã đánh dấu xuất hóa đơn điện tử thành công');
      setIsModalOpen(false);
      fetchInvoices();
    } catch (error) {
      message.error(error.response?.data?.reason || 'Lỗi khi xuất hóa đơn');
    }
  };

  return (
    <div>
       <div className="flex justify-between items-center mb-8">
        <h3 className="text-slate-800 font-black text-lg uppercase tracking-tight">Yêu cầu xuất Hóa đơn (B2B)</h3>
        <button className="border-2 border-slate-100 text-slate-600 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-orange-500 hover:text-orange-500 transition-all" onClick={fetchInvoices}>
           Làm mới
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-left">Ngày tạo</th>
              <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-left">Đơn hàng ID</th>
              <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-left">Thông tin xuất HĐ</th>
              <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-left">Trạng thái</th>
              <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="5" className="p-4 text-center text-slate-400">Đang tải...</td></tr>
            ) : invoices.length === 0 ? (
               <tr><td colSpan="5" className="p-4 text-center text-slate-400">Không có yêu cầu hóa đơn nào</td></tr>
            ) : (
            invoices.map(inv => (
              <tr key={inv.id} className="border-t border-slate-50">
                <td className="p-4 text-xs font-medium text-slate-600">
                  {dayjs(inv.createdAt).format('DD/MM/YYYY HH:mm')}
                </td>
                <td className="p-4 text-[11px] font-bold text-orange-500">
                  {inv.order ? inv.order.id.substring(0,8).toUpperCase() : 'N/A'}
                </td>
                <td className="p-4">
                  <div className="text-xs font-bold text-slate-800">{inv.companyName}</div>
                  <div className="text-[10px] text-slate-500">MST: {inv.taxCode}</div>
                  <div className="text-[10px] text-slate-500">{inv.billingAddress}</div>
                </td>
                <td className="p-4 text-xs font-bold">
                  {inv.isIssued ? (
                    <span className="text-green-500">Đã xuất (Mã: {inv.eInvoiceNumber})</span>
                  ) : (
                    <span className="text-orange-500">Chờ xuất HĐ</span>
                  )}
                </td>
                <td className="p-4 text-center space-x-2">
                  {!inv.isIssued && (
                    <button onClick={() => openIssueModal(inv)} className="text-[10px] px-3 py-1 bg-orange-100 text-orange-600 rounded-md font-black uppercase hover:bg-orange-200">Xuất HĐĐT</button>
                  )}
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title="Nhập số Hóa đơn điện tử (VNPT/Viettel/...)"
        open={isModalOpen}
        onOk={handleIssueInvoice}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Input 
          placeholder="Nhập mã số hóa đơn điện tử đã xuất..." 
          value={eInvoiceNumber} 
          onChange={e => setEInvoiceNumber(e.target.value)} 
        />
      </Modal>
    </div>
  );
};

export default InvoiceTab;