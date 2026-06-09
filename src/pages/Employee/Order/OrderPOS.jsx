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
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
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
    // Ưu tiên giá sự kiện (salePrice), nếu không có thì lấy giá gốc (basePrice)
    const currentPrice = item.salePrice > 0 ? item.salePrice : (item.basePrice || 0);
    
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
        setPaymentMethod('CASH');
        return;
      }
      try {
        const res = await api.get(`/customers/search?keyword=${searchQuery}`);
        const customerData = res.data;
        
        setSelectedCustomer(customerData);
        
        if (customerData.customerType === 'ENTERPRISE') {
          setPaymentMethod('DEBT');
          message.success(`Đã áp dụng giá sỉ cho: ${customerData.companyName || customerData.fullName}`);
        } else if (customerData.customerType === 'WORKER') {
          setPaymentMethod('WALLET');
          message.info(`Khách hàng Công nhân - Ưu tiên dùng Ví nội bộ`);
        } else {
          setPaymentMethod('CASH');
        }
      } catch (error) {
        message.error('Không tìm thấy khách hàng này!');
        setSelectedCustomer(null);
        setPaymentMethod('CASH');
      }
    }
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return message.warning('Giỏ hàng trống!');
    if (paymentMethod === 'DEBT' && selectedCustomer?.customerType !== 'ENTERPRISE') {
      return message.error('Chỉ doanh nghiệp đối tác mới được mua nợ!');
    }
    
    if (paymentMethod === 'WALLET') {
      if (!selectedCustomer) return message.error('Vui lòng định danh khách hàng trước khi dùng Ví!');
      setShowPinModal(true);
      return;
    }

    executeOrder();
  };

  const executeOrder = async (pin = null) => {
    setIsProcessing(true);
    try {
      const payload = {
        customerId: selectedCustomer?.id || null,
        warehouseId: 1,
        paymentMethod: paymentMethod,
        pinCode: pin, 
        items: cart.map(i => ({ productId: i.id, quantity: i.qty }))
      };
      
      await api.post('/orders/place', payload); 
      
      message.success('Chốt đơn thành công!');
      setCart([]);
      setShowPinModal(false);
      setPinCode('');
      
      if(paymentMethod !== 'DEBT') {
        setSelectedCustomer(null);
        setSearchQuery('');
        setPaymentMethod('CASH');
      }
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
                      {(item.salePrice > 0 ? item.salePrice : (item.basePrice || 0)).toLocaleString()}đ
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
              <button onClick={() => { setSelectedCustomer(null); setSearchQuery(''); setPaymentMethod('CASH'); }} className="ml-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
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
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button onClick={() => setPaymentMethod('CASH')} className={`py-3 flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all ${paymentMethod === 'CASH' ? 'border-[#111827] bg-[#111827] text-white' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
              <CreditCard size={16} />
              <span className="text-[9px] font-black uppercase tracking-wider">Tiền mặt</span>
            </button>
            <button onClick={() => setPaymentMethod('WALLET')} className={`py-3 flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all ${paymentMethod === 'WALLET' ? 'border-[#111827] bg-[#111827] text-white' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
              <Wallet size={16} />
              <span className="text-[9px] font-black uppercase tracking-wider">Ví Trả Trước</span>
            </button>
            <button 
              disabled={selectedCustomer?.customerType !== 'ENTERPRISE'}
              onClick={() => setPaymentMethod('DEBT')} 
              className={`py-3 flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all ${selectedCustomer?.customerType !== 'ENTERPRISE' ? 'opacity-40 cursor-not-allowed bg-slate-50 border-transparent' : paymentMethod === 'DEBT' ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
            >
              <FileText size={16} />
              <span className="text-[9px] font-black uppercase tracking-wider">Công nợ</span>
            </button>
          </div>

          <div className="flex justify-between items-end mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cần thanh toán</span>
            <span className="text-3xl font-black text-orange-500">{totalAmount.toLocaleString()}đ</span>
          </div>
          
          <button onClick={handleCheckoutClick} disabled={isProcessing} className="w-full bg-[#111827] hover:bg-orange-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[2px] transition-all flex items-center justify-center gap-2">
            <ShoppingCart size={16} /> {isProcessing ? 'Đang xử lý...' : 'Xác Nhận Lên Đơn'}
          </button>
        </div>
      </div>

      {/* MODAL BẢO MẬT MÃ PIN (WALLET PAYMENT) */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-[360px] rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 p-8 text-center relative">
            <button onClick={() => setShowPinModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500"><X size={20} /></button>
            
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
              <Lock size={28} />
            </div>
            
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-1">Xác Thực Ví Khách Hàng</h3>
            <p className="text-xs font-bold text-slate-400 mb-6">Vui lòng yêu cầu khách hàng {selectedCustomer?.fullName} nhập mã PIN để thanh toán.</p>
            
            <input 
              type="password" 
              maxLength="4"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))} // Chỉ cho nhập số
              className="w-full text-center tracking-[1em] text-3xl font-black text-slate-800 bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 mb-6 outline-none focus:border-blue-500 transition-colors"
              placeholder="••••"
              autoFocus
            />
            
            <button 
              onClick={() => executeOrder(pinCode)} 
              disabled={pinCode.length < 4 || isProcessing}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[2px] transition-all"
            >
              Xác Nhận Trừ Tiền
            </button>
          </div>
        </div>
      )}

    </div>
  );
}