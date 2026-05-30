import React from 'react';

const InventoryTable = ({ data }) => {
  return (
    <div className="bg-white rounded-[30px] shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
      <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Danh mục kho hàng</h3>
        <button className="bg-orange-500 text-white px-5 py-2 rounded-xl text-[10px] font-bold shadow-lg shadow-orange-200">+ Nhập kho</button>
      </div>
      <table className="w-full text-left text-[11px]">
        <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[9px]">
          <tr>
            <th className="px-8 py-4">Nguyên liệu</th>
            <th className="px-8 py-4 text-center">Tồn kho</th>
            <th className="px-8 py-4 text-center">Tình trạng</th>
            <th className="px-8 py-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b border-slate-50 hover:bg-orange-50/20 transition-colors">
              <td className="px-8 py-5 font-bold text-slate-800">{item.name}</td>
              <td className="px-8 py-5 text-center font-black">{item.stock} {item.unit}</td>
              <td className="px-8 py-5 text-center">
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${item.stock < 5 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                  {item.status}
                </span>
              </td>
              <td className="px-8 py-5 text-right"><button className="text-slate-400 hover:text-orange-500"><i className="fas fa-edit"></i></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;