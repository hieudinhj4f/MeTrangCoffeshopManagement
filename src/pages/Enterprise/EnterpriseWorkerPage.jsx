import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const EnterpriseWorkerPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/customers/enterprise/workers', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setWorkers(response.data);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải danh sách công nhân:', err);
        setError('Không thể tải danh sách công nhân. ' + (err.response?.data?.reason || ''));
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [token]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Quản lý nhân sự</h2>
          <p className="text-xs text-slate-500 mt-1">Danh sách công nhân thuộc quyền quản lý</p>
        </div>
        <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <i className="fas fa-users"></i>
          Tổng cộng: {workers.length} nhân sự
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 text-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-users-slash text-slate-400 text-2xl"></i>
            </div>
            <h3 className="text-slate-700 font-bold mb-1">Chưa có công nhân nào</h3>
            <p className="text-slate-500 text-sm">Hiện tại doanh nghiệp chưa có công nhân nào được liên kết.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-slate-500 uppercase border-b border-slate-200 rounded-tl-xl">Họ tên</th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-slate-500 uppercase border-b border-slate-200">Số điện thoại</th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-slate-500 uppercase border-b border-slate-200">Email</th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-slate-500 uppercase border-b border-slate-200 rounded-tr-xl">Số dư ví</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                          {worker.fullName ? worker.fullName.charAt(0).toUpperCase() : 'W'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{worker.fullName || 'Chưa cập nhật'}</p>
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold mt-1">
                            WORKER
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {worker.phoneNumber || <span className="text-slate-400 italic">Chưa có</span>}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {worker.email || <span className="text-slate-400 italic">Chưa có</span>}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-bold text-orange-600">
                      {worker.wallet?.balance ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(worker.wallet.balance) : '0 ₫'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseWorkerPage;
