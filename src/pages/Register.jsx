import React, { useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { message } from 'antd';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/register', form);
      login(response.data);
      message.success('Đăng ký thành công!');
      navigate('/shop');
    } catch (error) {
      const reason = error.response?.data?.reason || 'Đăng ký thất bại!';
      message.error(reason);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0a1628] to-[#1e3563]">
      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-[30px] shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-[#0a1628] mb-2">Tạo tài khoản</h2>
        <p className="text-center text-sm text-gray-500 mb-8">Đăng ký để mua hàng và nạp ví</p>
        <form onSubmit={handleRegister} className="space-y-4">
          <input name="fullName" placeholder="Họ và tên" value={form.fullName} onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#e8631a]" />
          <input name="username" placeholder="Username" value={form.username} onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#e8631a]" required />
          <input name="password" type="password" placeholder="Mật khẩu" value={form.password} onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#e8631a]" required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#e8631a]" />
          <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#e8631a]" />
          <button type="submit" disabled={loading}
            className="w-full bg-[#e8631a] hover:bg-[#f5873b] text-white font-bold py-3 rounded-xl disabled:opacity-60">
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-600">
          Đã có tài khoản? <Link to="/login" className="font-semibold text-[#e8631a]">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
