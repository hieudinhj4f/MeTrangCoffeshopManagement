import React from 'react';

const InvoiceTab = ({ warehouseId: _warehouseId }) => {
  // Mock data hóa đơn
  const invoices = [
    { id: 'HD-001', customer: 'Nguyễn Văn Hiếu', total: '250,000đ', status: 'PAID', date: '16/05/2026' },
  ];

  return (
    <div>
       <div className="flex justify-between items-center mb-8">
        <h3 className="text-slate-800 font-black text-lg uppercase tracking-tight">Hóa đơn bán hàng</h3>
        <button className="border-2 border-slate-100 text-slate-600 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-orange-500 hover:text-orange-500 transition-all">
          <i className="fas fa-file-export mr-2"></i> Xuất báo cáo PDF
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-left">Mã HĐ</th>
              <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-left">Khách hàng</th>
              <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-left">Tổng tiền</th>
              <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-t border-slate-50">
                <td className="p-4 text-[11px] font-bold text-orange-500">{inv.id}</td>
                <td className="p-4 text-xs font-medium text-slate-600">{inv.customer}</td>
                <td className="p-4 text-xs font-black text-slate-800">{inv.total}</td>
                <td className="p-4 text-center space-x-2">
                  <button className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-500">In</button>
                  <button className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500">Hủy HĐ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceTab;