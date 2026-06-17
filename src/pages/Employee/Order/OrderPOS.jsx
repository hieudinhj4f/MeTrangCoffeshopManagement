import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, User, Building2, CreditCard, Wallet, FileText, Lock, X } from 'lucide-react';
import { message } from 'antd';
import api from '../../../services/api'; 

export default function OrderPOS() {

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null); 
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('WALLET');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingMenu(true);
      try {
        const res = await api.get('/products');
        setMenuItems(res.data);
      } catch (error) {
        message.error('Không thể tải danh sách sản phẩm!');
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchProducts();
  }, []);


  const getDisplayPrice = (item) => {
    const currentPrice = item.basePrice || 0;
    
    if (selectedCustomer?.customerType === 'ENTERPRISE') {
      return currentPrice * 0.85; // Chiết khấu 15% cho Doanh nghiệp
    }
    return currentPrice;
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: item.qty + delta } : item).filter(item => item.qty > 0));
  };

  // Tính tổng tiền giỏ hàng dùng hàm getDisplayPrice đã được fix
  const totalAmount = cart.reduce((sum, item) => sum + (getDisplayPrice(item) * item.qty), 0);

  const handleSearchCustomer = async (e) => {
    if (e.key === 'Enter') {
      if (!searchQuery.trim()) {
        setSelectedCustomer(null);
        setPaymentMethod('WALLET');
        return;
      }
      try {
        const res = await api.get(`/customers/search?keyword=${searchQuery}`);
        const customerData = res.data;
        
        setSelectedCustomer(customerData);
        
        if (customerData.customerType === 'ENTERPRISE') {
          message.success(`Đã áp dụng chiết khấu Doanh nghiệp: ${customerData.companyName || customerData.fullName}`);
        } else if (customerData.customerType === 'WORKER') {
          message.info(`Khách hàng Công nhân - Dùng Ví nội bộ để thanh toán`);
        }
        setPaymentMethod('WALLET');
      } catch (error) {
        message.error('Không tìm thấy khách hàng này!');
        setSelectedCustomer(null);
        setPaymentMethod('WALLET');
      }
    }
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return message.warning('Giỏ hàng trống!');

    if (paymentMethod === 'WALLET' && !selectedCustomer) {
      return message.error('Vui lòng định danh khách hàng trước khi dùng Ví!');
    }

    executeOrder();
  };

  const executeOrder = async () => {
    setIsProcessing(true);
    try {
      const payload = {
        customerId: selectedCustomer?.id || null,
        warehouseId: 1,
        paymentMethod: paymentMethod,
        items: cart.map(i => ({ productId: i.id, quantity: i.qty }))
      };
      
      await api.post('/orders/place', payload); 
      
      message.success('Chốt đơn thành công!');
      setCart([]);
      
      setSelectedCustomer(null);
      setSearchQuery('');
      setPaymentMethod('WALLET');
    } catch (error) {
      message.error(error.response?.data?.reason || 'Có lỗi xảy ra khi tạo đơn!');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      
      {/* TRÁI: MENU & TÌM KIẾM SẢN PHẨM */}
      <div className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Bán Hàng POS</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Hệ thống phân luồng Đa kênh</p>
          </div>
          <div className="bg-white px-4 py-3 rounded-2xl flex items-center border border-slate-200 w-80 shadow-sm">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Tìm tên món, mã vạch..." className="w-full ml-3 outline-none text-sm font-bold text-slate-700" />
          </div>
        </div>

        <div className="grid grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-20">
          {loadingMenu ? (
            <div className="col-span-full text-center text-slate-400 font-bold uppercase tracking-widest py-10">Đang tải thực đơn...</div>
          ) : (
            menuItems.map(item => (
              <div key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 rounded-[24px] cursor-pointer hover:shadow-lg transition-all border border-slate-100 group">
                <div className="h-32 bg-slate-100 rounded-xl mb-4 overflow-hidden relative">
                  <img src={item.imageUrl || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">{item.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  
                  {/* HIỂN THỊ GIÁ TRÊN THẺ MÓN */}
                  <span className="font-black text-orange-500">{getDisplayPrice(item).toLocaleString()}đ</span>
                  {selectedCustomer?.customerType === 'ENTERPRISE' && (
                    <span className="text-[10px] line-through text-slate-400">
                      {(item.basePrice || 0).toLocaleString()}đ
                    </span>
                  )}

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PHẢI: GIỎ HÀNG & THÔNG TIN KHÁCH */}
      <div className="w-[420px] bg-white border-l border-slate-200 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-10">
        
        {/* Chọn khách hàng */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Thông tin khách hàng</label>
          <div className="bg-white border border-slate-200 rounded-xl flex items-center px-4 py-3 focus-within:border-orange-500 transition-colors">
            {selectedCustomer?.customerType === 'ENTERPRISE' ? <Building2 size={16} className="text-orange-500" /> : <User size={16} className="text-slate-400" />}
            <input 
              type="text" 
              placeholder="Nhập SĐT / Mã số thuế rổi Enter" 
              className="w-full ml-3 outline-none text-xs font-bold text-slate-700 placeholder-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchCustomer}
            />
            {selectedCustomer && (
              <button onClick={() => { setSelectedCustomer(null); setSearchQuery(''); setPaymentMethod('WALLET'); }} className="ml-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
            )}
          </div>
          
          {/* Box thông tin hiển thị nếu có khách hàng */}
          {selectedCustomer && (
            <div className={`mt-3 p-3 border rounded-xl ${selectedCustomer.customerType === 'ENTERPRISE' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
              <div className={`font-bold text-xs mb-1 ${selectedCustomer.customerType === 'ENTERPRISE' ? 'text-orange-800' : 'text-blue-800'}`}>
                {selectedCustomer.companyName || selectedCustomer.fullName}
              </div>
              <div className={`flex justify-between text-[10px] font-semibold ${selectedCustomer.customerType === 'ENTERPRISE' ? 'text-orange-600/80' : 'text-blue-600/80'}`}>
                {selectedCustomer.customerType === 'ENTERPRISE' ? (
                  <>
                    <span>Nợ hiện tại: {(selectedCustomer.currentDebt || 0).toLocaleString()}đ</span>
                    <span>Hạn mức: {(selectedCustomer.creditLimit || 0).toLocaleString()}đ</span>
                  </>
                ) : (
                  <span>Số dư ví: {(selectedCustomer.walletBalance || 0).toLocaleString()}đ</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Danh sách món */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <ShoppingCart size={48} className="mb-4 opacity-50" />
              <p className="font-bold text-xs uppercase tracking-widest">Chưa có món nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img src={item.imageUrl || 'https://via.placeholder.com/150'} className="w-12 h-12 rounded-lg object-cover bg-slate-100" alt={item.name}/>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 text-xs">{item.name}</div>
                    
                    {/* HIỂN THỊ GIÁ TRONG GIỎ HÀNG */}
                    <div className="text-orange-500 font-black text-xs mt-1">{getDisplayPrice(item).toLocaleString()}đ</div>
                    
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-100">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-800"><Minus size={12} /></button>
                    <span className="font-bold text-xs w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-800"><Plus size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tổng tiền & Chốt đơn */}
        <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">


          <div className="flex justify-between items-end mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cần thanh toán</span>
            <span className="text-3xl font-black text-orange-500">{totalAmount.toLocaleString()}đ</span>
          </div>
          
          <button onClick={handleCheckoutClick} disabled={isProcessing} className="w-full bg-[#111827] hover:bg-orange-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[2px] transition-all flex items-center justify-center gap-2">
            <ShoppingCart size={16} /> {isProcessing ? 'Đang xử lý...' : 'Xác Nhận Lên Đơn'}
          </button>
        </div>
      </div>

      </div>

    </div>
  );
}