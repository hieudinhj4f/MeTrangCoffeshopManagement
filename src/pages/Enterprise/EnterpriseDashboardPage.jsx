import React, { useState } from 'react';
import EnterpriseTopUp from './EnterpriseTopUp';
import EnterpriseWorkerPage from './EnterpriseWorkerPage';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EnterpriseDashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('wallet');
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. SIDEBAR */}
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
          <p className="px-8 mt-6 mb-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Hệ thống</p>
          <button 
            onClick={() => setActiveTab('wallet')}
            className={`w-full flex items-center px-6 py-3 transition-all ${activeTab === 'wallet' ? 'text-orange-500 bg-orange-500/5 border-r-4 border-orange-500' : 'text-slate-400 hover:text-white hover:bg-white/5 border-r-4 border-transparent'}`}
          >
            <i className="fas fa-wallet w-5 text-sm"></i>
            {isSidebarOpen && <span className="ml-4 text-[10px] font-bold uppercase tracking-wider">Quản lý quỹ</span>}
          </button>

          <button 
            onClick={() => setActiveTab('workers')}
            className={`w-full flex items-center px-6 py-3 transition-all ${activeTab === 'workers' ? 'text-orange-500 bg-orange-500/5 border-r-4 border-orange-500' : 'text-slate-400 hover:text-white hover:bg-white/5 border-r-4 border-transparent'}`}
          >
            <i className="fas fa-users w-5 text-sm"></i>
            {isSidebarOpen && <span className="ml-4 text-[10px] font-bold uppercase tracking-wider">Nhân sự</span>}
          </button>
        </nav>
        
        <div className="p-4 border-t border-white/5">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-6 py-3 text-red-500 hover:bg-red-500/10 transition-all rounded-lg"
            >
              <i className="fas fa-sign-out-alt w-5 text-sm"></i>
              {isSidebarOpen && <span className="ml-4 text-[10px] font-bold uppercase">Đăng xuất</span>}
            </button>
        </div>
      </aside>

      {/* 2. MAIN AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-[#111827] px-8 flex items-center justify-between text-white shadow-lg border-b border-white/5">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-orange-500">
              <i className="fas fa-bars-staggered text-sm"></i>
            </button>
            <div className="h-4 w-[1px] bg-white/10"></div>
            
            <h2 className="text-[10px] font-black uppercase tracking-[3px] text-white">
              ENTERPRISE PORTAL
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col justify-center text-right h-10 py-1">
              <p className="text-[11px] font-extrabold text-white leading-none mb-1">{user?.fullName || 'Doanh Nghiệp'}</p>
              <p className="text-[8px] text-orange-500 font-black uppercase tracking-tighter leading-none">
                ENTERPRISE
              </p>
            </div>
            <div className="relative cursor-pointer">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.fullName || 'E'}&background=f97316&color=fff&bold=true`}
                className="w-9 h-9 rounded-xl border border-white/10 shadow-lg" 
                alt="avatar" 
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-[#111827] rounded-full"></div>
            </div>
          </div>
        </header>

        {/* 3. CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
           {activeTab === 'wallet' && <EnterpriseTopUp />}
           {activeTab === 'workers' && <EnterpriseWorkerPage />}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
      `}</style>
    </div>
  );
};

export default EnterpriseDashboardPage;
