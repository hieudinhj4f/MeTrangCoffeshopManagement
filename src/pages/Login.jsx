import React, { useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { message } from 'antd';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data);
      message.success('Đăng nhập thành công!');

      if (response.data.role === 'CUSTOMER') {
        navigate('/shop');
      } else if (response.data.role === 'ENTERPRISE') {
        navigate('/enterprise/dashboard');
      } else if (response.data.role === 'STAFF') {
        navigate('/dashboard', { state: { activeTab: 'POS' } });
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const reason = error.response?.data?.reason || 'Sai tài khoản hoặc mật khẩu!';
      message.error(reason);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#f3a638] to-[#fde68a]">
      <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[30px] shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-[#92400e] mb-8">Đăng nhập</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-4 rounded-2xl shadow-md outline-none border-none focus:ring-2 focus:ring-[#f3a638]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-2xl shadow-md outline-none border-none focus:ring-2 focus:ring-[#f3a638]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f3a638] hover:bg-[#d97706] transition-all text-white font-bold py-3 rounded-2xl shadow-lg disabled:opacity-60"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
