import React, { useState } from 'react';
import WarehousePage from './warehouse/WarehousePage.jsx';
import B2BManager from './inventory/B2BManager.jsx';
import AccountManagement from './account/AccountManagementPage.jsx';
import SupplierPage from './supplier/SupplierPage.jsx';
import EmployeeManagement from './employee/EmployeeManagement.jsx';
import ProductManagementPage from './product/ProductManagementPage.jsx';
import OrderManagement from '../Employee/Order/OrderManagement.jsx';
import StatisticsPage from '../Admin/static/StatisticPage.jsx';
import OrderPOS from '../Employee/Order/OrderPOS.jsx';
import EnterpriseTopUp from '../Enterprise/EnterpriseTopUp.jsx';
import { Orbit } from 'lucide-react';

const DashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dash');

  const modules = [

    { id: 'accounts', label: 'Quản lý tài khoản', icon: 'fa-users-gear', group: 'Hệ thống' },
    { id: 'wallet_topup', label: 'Quản lý quỹ nội bộ', icon: 'fa-wallet', group: 'Hệ thống' },

    { id: 'inventory', label: 'Quản lý Nhập/Xuất', icon: 'fa-boxes-stacked', group: 'Kho hàng' },
    { id: 'export', label: 'Quản lý sản phẩm', icon: 'fa-box-open', group: 'Kho hàng' },

    { id: 'suppliers', label: 'Nhà cung cấp', icon: 'fa-handshake', group: 'Đối tác' },
    { id: 'entry', label: 'Quản lý đối tác ', icon: 'fa-building', group: 'Đối tác' },


    // Các module khác có thể thêm vào đây...
    { id: "orders", label: 'Quản lý đơn hàng', icon: 'fa-receipt', group: 'Đơn hàng' },
    { id: "POS", label: 'Bán hàng POS', icon: 'fa-cash-register', group: ' Đơn hàng' },

    { id: "reports", label: 'Báo cáo', icon: 'fa-chart-line', group: 'Phân tích' },
  ];

  const warehouseModuleIds = ['inventory', 'entry', 'export'];

  const getWarehouseInitialTab = (moduleId) => {
    if (moduleId === 'export') return 'transactions';
    if (moduleId === 'entry') return 'invoices';
    return 'inventory';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dash':
        return (
          <div className="bg-white rounded-[32px] p-12 shadow-sm border border-slate-100 text-center">
            <h3 className="text-slate-800 font-black text-xl uppercase tracking-widest italic mb-2">
              CHÀO MỪNG HIẾU TRỞ LẠI!
            </h3>
            <p className="text-slate-400 text-xs font-medium italic">
              Hệ thống điều phối Mê Trang đã sẵn sàng.
            </p>
          </div>
        );
      case 'accounts':
        return <EmployeeManagement />;

      case 'wallet_topup':
        return <EnterpriseTopUp />;

      case 'inventory':
        return <WarehousePage />;

      case 'entry':
        return <B2BManager />;

      case 'suppliers':
        return <SupplierPage />;

      case 'export':
        return <ProductManagementPage />;

      case 'orders':
        return <OrderManagement />;

      case 'reports':
        return <StatisticsPage />;

      case 'POS':
        return <OrderPOS />;

      default:
        return (
          <div className="bg-white rounded-[32px] p-12 shadow-sm border border-slate-100 text-center">
            <h3 className="text-slate-800 font-black text-xl uppercase tracking-widest italic mb-2">
              CHÀO MỪNG HIẾU TRỞ LẠI!
            </h3>
            <p className="text-slate-400 text-xs font-medium italic">
              Hệ thống điều phối Mê Trang đã sẵn sàng.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <aside className={`${isSidebarOpen ? 'w-60' : 'w-20'} bg-[#111827] transition-all duration-300 flex flex-col z-20 shadow-2xl`}>
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <span style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: isSidebarOpen ? '26px' : '18px',
            color: '#f97316',
            transition: 'all 0.3s'
          }}>
            {isSidebarOpen ? 'Mê Trang' : 'MT'}
          </span>

        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-1 custom-scrollbar">
          {modules.map((mod, idx) => {
            const isGroupStart = idx === 0 || modules[idx - 1].group !== mod.group;
            return (
              <React.Fragment key={mod.id}>
                {isSidebarOpen && isGroupStart && (
                  <p className="px-8 mt-6 mb-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">{mod.group}</p>
                )}
                <button
                  onClick={() => setActiveTab(mod.id)}
                  className={`w-full flex items-center px-6 py-3 transition-all ${activeTab === mod.id
                      ? 'text-orange-500 bg-orange-500/5 border-r-4 border-orange-500'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <i className={`fas ${mod.icon} w-5 text-sm`}></i>
                  {isSidebarOpen && <span className="ml-4 text-[10px] font-bold">{mod.label}</span>}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </aside>

      {/* 2. MAIN AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER: Fix màu Command Center thành Trắng */}
        <header className="h-16 bg-[#111827] px-8 flex items-center justify-between text-white shadow-lg border-b border-white/5">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-orange-500">
              <i className="fas fa-bars-staggered text-sm"></i>
            </button>
            <div className="h-4 w-[1px] bg-white/10"></div>

            {/* Chữ Command Center ép màu Trắng (text-white) */}
            <h2 className="text-[10px] font-black uppercase tracking-[3px] text-white">
              COMMAND CENTER
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Profile: Căn giữa cực đẹp giữa 2 dòng */}
            <div className="flex flex-col justify-center text-right h-10 py-1">
              <p className="text-[11px] font-extrabold text-white leading-none mb-1">Hiếu Admin</p>
              <p className="text-[8px] text-orange-500 font-black uppercase tracking-tighter leading-none">
                SUPERUSER ONLINE
              </p>
            </div>
            <div className="relative cursor-pointer">
              <img
                src="https://ui-avatars.com/api/?name=Hieu&background=f97316&color=fff&bold=true"
                className="w-9 h-9 rounded-xl border border-white/10 shadow-lg"
                alt="avatar"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-[#111827] rounded-full"></div>
            </div>
          </div>
        </header>

        {/* 3. CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          {renderContent(activeTab)}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
      `}</style>
    </div>
  );
};

export default DashboardPage;
