import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getProductPrice } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getMyBalance, topUp } from '../../services/walletService';
import { placeOrder } from '../../services/orderService';
import { message } from 'antd';
import { ShoppingCart, Plus, Minus, Trash2, Star, ArrowRight, X, ChevronRight, Wallet, LogOut } from 'lucide-react';

const CART_KEY = 'cart';
const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
};


const CATEGORIES = ['All', 'Espresso', 'Cold Brew', 'Pour Over', 'Signature', 'Specialty', 'Latte'];

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0a1628;
    --navy-mid: #122040;
    --navy-light: #1e3563;
    --orange: #e8631a;
    --orange-light: #f5873b;
    --orange-dim: rgba(232,99,26,0.12);
    --white: #ffffff;
    --off-white: #f8f7f4;
    --grey-100: #f2f1ee;
    --grey-300: #d0cec9;
    --grey-500: #9b9690;
    --text-dark: #0a1628;
    --text-mid: #4a4845;
    --radius-sm: 6px;
    --radius-md: 14px;
    --radius-lg: 24px;
    --shadow-card: 0 2px 20px rgba(10,22,40,0.08);
    --shadow-card-hover: 0 12px 48px rgba(10,22,40,0.18);
    --transition: 0.32s cubic-bezier(0.23, 1, 0.32, 1);
  }

  body { background: var(--off-white); color: var(--text-dark); font-family: 'DM Sans', sans-serif; }

  /* NAV */
  .nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 56px; height: 72px;
    background: var(--navy);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .nav-logo {
    display: flex; align-items: center; gap: 12px;
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px; font-weight: 700; color: var(--white);
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .nav-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--orange); }
  .nav-right { display: flex; align-items: center; gap: 28px; }
  .nav-user {
    display: flex; flex-direction: column; align-items: flex-end;
  }
  .nav-user-label {
    font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--orange); font-weight: 600;
  }
  .nav-user-name { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.9); }
  .cart-btn {
    position: relative; background: none; border: none; cursor: pointer;
    padding: 10px; border-radius: 50%;
    transition: background var(--transition);
  }
  .cart-btn:hover { background: rgba(255,255,255,0.08); }
  .cart-badge {
    position: absolute; top: 2px; right: 2px;
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--orange); color: var(--white);
    font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--navy);
  }

  /* HERO */
  .hero {
    position: relative; overflow: hidden;
    background: var(--navy);
    padding: 80px 56px 100px;
  }
  .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; max-width: 1280px; margin: 0 auto; }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
    color: var(--orange); font-weight: 600; margin-bottom: 28px;
  }
  .hero-eyebrow::before { content: ''; width: 32px; height: 1px; background: var(--orange); }
  .hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(48px, 5vw, 72px); font-weight: 700; line-height: 1.05;
    color: var(--white); margin-bottom: 24px;
  }
  .hero-title em { font-style: italic; color: var(--orange); }
  .hero-sub {
    font-size: 16px; line-height: 1.7; color: rgba(255,255,255,0.55);
    max-width: 400px; margin-bottom: 44px; font-weight: 300;
  }
  .hero-cta {
    display: inline-flex; align-items: center; gap: 12px;
    background: var(--orange); color: var(--white);
    padding: 16px 36px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
    border: none; cursor: pointer;
    transition: all var(--transition);
  }
  .hero-cta:hover { background: var(--orange-light); gap: 18px; }

  .hero-visual {
    display: flex; flex-direction: column; gap: 16px;
  }
  .hero-stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .hero-stat {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius-md);
    padding: 24px 28px;
    backdrop-filter: blur(10px);
  }
  .hero-stat-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px; font-weight: 700; color: var(--orange);
    line-height: 1; margin-bottom: 6px;
  }
  .hero-stat-label { font-size: 12px; color: rgba(255,255,255,0.45); letter-spacing: 1px; text-transform: uppercase; }
  .hero-feat {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(232,99,26,0.25);
    border-radius: var(--radius-md);
    padding: 20px 28px;
    display: flex; align-items: center; gap: 16px;
  }
  .hero-feat-icon {
    width: 44px; height: 44px; border-radius: 50%;
    background: var(--orange-dim); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .hero-feat-text { font-size: 14px; color: rgba(255,255,255,0.7); font-weight: 300; }
  .hero-feat-text strong { color: var(--white); font-weight: 600; display: block; margin-bottom: 2px; }

  /* PRODUCTS SECTION */
  .section { padding: 80px 56px; max-width: 1280px; margin: 0 auto; }
  .section-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 48px; }
  .section-label {
    font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
    color: var(--orange); font-weight: 600; margin-bottom: 12px;
  }
  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px; font-weight: 700; color: var(--text-dark); line-height: 1.1;
  }

  /* FILTER TABS */
  .filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
  .filter-tab {
    padding: 8px 20px; border-radius: 100px;
    font-size: 13px; font-weight: 500; cursor: pointer;
    border: 1px solid var(--grey-300);
    background: var(--white); color: var(--text-mid);
    transition: all var(--transition);
  }
  .filter-tab:hover { border-color: var(--orange); color: var(--orange); }
  .filter-tab.active { background: var(--navy); color: var(--white); border-color: var(--navy); }

  /* PRODUCT GRID */
  .product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; }

  .product-card {
    background: var(--white);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-card);
    transition: all var(--transition);
    cursor: pointer;
  }
  .product-card:hover { box-shadow: var(--shadow-card-hover); transform: translateY(-6px); }
  .product-card:hover .product-img { transform: scale(1.06); }

  .product-img-wrap { position: relative; overflow: hidden; height: 240px; }
  .product-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.23,1,0.32,1); }
  .product-badge {
    position: absolute; top: 14px; left: 14px;
    background: rgba(255,255,255,0.96); border-radius: 100px;
    padding: 5px 12px; display: flex; align-items: center; gap: 5px;
    font-size: 12px; font-weight: 700; box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  }
  .product-badge svg { color: var(--orange); fill: var(--orange); }

  .product-body { padding: 22px 22px 20px; }
  .product-cat {
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--orange); font-weight: 600; margin-bottom: 8px;
  }
  .product-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px; font-weight: 700; color: var(--text-dark);
    line-height: 1.2; margin-bottom: 18px;
    height: 48px; overflow: hidden;
  }
  .product-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid var(--grey-100); }
  .product-price { font-size: 22px; font-weight: 700; color: var(--navy); }
  .product-price small { font-size: 13px; font-weight: 400; color: var(--grey-500); }
  .add-btn {
    width: 42px; height: 42px; border-radius: 50%;
    background: var(--navy); color: var(--white); border: none;
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    transition: all var(--transition); flex-shrink: 0;
  }
  .add-btn:hover { background: var(--orange); transform: scale(1.1); }

  /* CART DRAWER */
  .drawer-overlay {
    position: fixed; inset: 0; background: rgba(10,22,40,0.5);
    backdrop-filter: blur(4px); z-index: 200;
    opacity: 0; pointer-events: none; transition: opacity var(--transition);
  }
  .drawer-overlay.open { opacity: 1; pointer-events: all; }
  .drawer {
    position: fixed; top: 0; right: 0; bottom: 0; width: 480px;
    background: var(--white); z-index: 201;
    display: flex; flex-direction: column;
    transform: translateX(100%); transition: transform var(--transition);
    box-shadow: -20px 0 80px rgba(10,22,40,0.2);
  }
  .drawer.open { transform: translateX(0); }

  .drawer-head {
    padding: 28px 32px; background: var(--navy);
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .drawer-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px; font-weight: 700; color: var(--white); letter-spacing: 0.05em;
  }
  .drawer-close {
    background: rgba(255,255,255,0.1); border: none; color: var(--white);
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background var(--transition);
  }
  .drawer-close:hover { background: rgba(255,255,255,0.2); }

  .drawer-body { flex: 1; overflow-y: auto; padding: 8px 0; }
  .cart-item { display: flex; gap: 18px; align-items: center; padding: 20px 32px; border-bottom: 1px solid var(--grey-100); }
  .cart-item img { width: 72px; height: 72px; border-radius: var(--radius-md); object-fit: cover; flex-shrink: 0; }
  .cart-item-info { flex: 1; min-width: 0; }
  .cart-item-name { font-size: 15px; font-weight: 600; color: var(--text-dark); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cart-item-price { font-size: 14px; color: var(--orange); font-weight: 600; margin-bottom: 12px; }
  .qty-control {
    display: inline-flex; align-items: center; gap: 0;
    border: 1px solid var(--grey-300); border-radius: 100px; overflow: hidden;
  }
  .qty-btn {
    width: 30px; height: 30px; background: none; border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--text-dark); transition: background var(--transition);
  }
  .qty-btn:hover { background: var(--grey-100); }
  .qty-num { min-width: 28px; text-align: center; font-size: 13px; font-weight: 600; }
  .remove-btn {
    background: none; border: none; color: var(--grey-300);
    cursor: pointer; padding: 8px; transition: color var(--transition);
  }
  .remove-btn:hover { color: #e53935; }

  .cart-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 16px; color: var(--grey-500); padding: 64px 32px; text-align: center; }
  .cart-empty svg { opacity: 0.2; }
  .cart-empty p { font-size: 15px; }

  .drawer-foot {
    padding: 28px 32px 36px;
    border-top: 1px solid var(--grey-100);
    background: var(--white);
  }
  .total-row { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; }
  .total-label { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--grey-500); font-weight: 600; }
  .total-amount { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 700; color: var(--navy); line-height: 1; }
  .checkout-btn {
    width: 100%; padding: 18px; border-radius: var(--radius-md);
    background: var(--navy); color: var(--white); border: none;
    font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; transition: all var(--transition);
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .checkout-btn:hover { background: var(--orange); gap: 16px; }
  .checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .wallet-bar {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 16px; margin: 0 32px 12px;
    background: var(--grey-100); border-radius: var(--radius-md);
    font-size: 13px;
  }
  .wallet-bar strong { color: var(--orange); }
  .topup-btn {
    margin-left: auto; padding: 6px 14px; border-radius: 100px;
    background: var(--navy); color: white; border: none; font-size: 12px;
    font-weight: 600; cursor: pointer;
  }
  .topup-btn:hover { background: var(--orange); }
  .logout-btn {
    background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.6);
    padding: 8px; border-radius: 50%;
  }
  .logout-btn:hover { color: white; background: rgba(255,255,255,0.08); }

  /* Responsive */
  @media (max-width: 1200px) { .product-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 900px) {
    .nav, .hero, .section { padding-left: 24px; padding-right: 24px; }
    .hero-grid { grid-template-columns: 1fr; }
    .hero-visual { display: none; }
    .product-grid { grid-template-columns: repeat(2, 1fr); }
    .section-header { flex-direction: column; align-items: flex-start; gap: 24px; }
    .drawer { width: 100%; }
  }
  @media (max-width: 560px) { .product-grid { grid-template-columns: 1fr; } }
`;


export default function HomePage() {
  const { user, logout, getCustomerId } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(loadCart);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletRank, setWalletRank] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await getMyBalance();
      setWalletBalance(Number(res.data.balance));
      setWalletRank(res.data.rank || '');
    } catch {
      setWalletBalance(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/products')
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.token) fetchWallet();
  }, [user, fetchWallet]);

  // ─── 2. LOGIC LỌC SẢN PHẨM ───
  const filtered = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.categoryName === activeCategory); 

  // ─── 3. LOGIC GIỎ HÀNG ───
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id); 
      return existing
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) 
        : [...prev, { ...product, qty: 1 }]; 
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i) 
      .filter(i => i.qty > 0) 
    );
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id)); 

  // ─── 4. LOGIC TÍNH TOÁN (SỬA LỖI UNDEFINED) ───
  const totalQty = cart.reduce((s, i) => s + i.qty, 0); 
  const totalAmount = cart.reduce((s, i) => s + getProductPrice(i) * i.qty, 0);

  const handleTopUp = async () => {
    const raw = window.prompt('Nhập số tiền nạp (VNĐ):', '100000');
    if (!raw) return;
    const amount = Number(raw.replace(/\D/g, ''));
    if (!amount || amount <= 0) {
      message.error('Số tiền không hợp lệ');
      return;
    }
    try {
      const res = await topUp(amount);
      setWalletBalance(Number(res.data.newBalance));
      message.success(`Nạp thành công! Số dư: ${Number(res.data.newBalance).toLocaleString('vi-VN')}đ`);
      if (res.data.customerId && user) {
        const updated = { ...user, customerId: res.data.customerId };
        localStorage.setItem('user', JSON.stringify(updated));
        localStorage.setItem('customerId', res.data.customerId);
      }
    } catch (err) {
      message.error(err.response?.data?.reason || 'Nạp tiền thất bại');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!user?.token) {
      message.warning('Vui lòng đăng nhập để đặt hàng');
      navigate('/login');
      return;
    }

    // Bắt buộc thanh toán bằng Ví Nội Bộ (Ví Trả Trước)
    const currentPaymentMethod = 'WALLET';

    if (walletBalance < totalAmount) {
      message.warning('Số dư ví không đủ. Vui lòng nạp thêm tiền.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await placeOrder({
        customerId: getCustomerId() || user.id,
        warehouseId: 1,
        paymentMethod: currentPaymentMethod, 
        isOnlineOrder: true,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.qty,
        })),
      });

      message.success(`Đặt hàng thành công! Mã đơn: ${response.data.orderId?.slice(0, 8)}...`);
      setCart([]);
      localStorage.removeItem(CART_KEY);
      setDrawerOpen(false);
      fetchWallet(); 
    } catch (err) {
      const errorMsg = err.response?.data?.reason || 'Lỗi đặt hàng';
      message.error(errorMsg);
      if (errorMsg.includes('không đủ')) fetchWallet();
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{css}</style>
{/* ── NAV ── */}
      <nav className="nav" style={{ position: 'relative' }}>
        <div className="nav-logo">
          <div className="nav-logo-dot" />
          Mê Trang
        </div>
        
        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* Nút "Thông tin trang" cách điệu theo tone màu Mê Trang */}
          <div 
            className="nav-user" 
            style={{ 
              cursor: 'pointer', 
              position: 'relative', 
              userSelect: 'none',
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: showMenu ? '#92400e' : 'rgba(255, 255, 255, 0.08)',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(243, 166, 56, 0.3)' // Viền cam mảnh
            }}
            onClick={() => setShowMenu(!showMenu)}
          >
            <span style={{ 
              color: showMenu ? '#fde68a' : '#ffffff', // Khi mở menu thì đổi chữ sang màu vàng nhạt
              fontWeight: '700', 
              fontSize: '14px',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              Thông tin trang {showMenu ? '▴' : '▾'}
            </span>

            {/* Menu danh sách các module đổ xuống */}
            {showMenu && (
              <div style={{
                position: 'absolute',
                top: '125%',
                right: 0,
                backgroundColor: '#92400e', // Nền màu nâu cà phê đậm đồng bộ
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                padding: '6px 0',
                minWidth: '180px',
                zIndex: 999,
                border: '1px solid #d97706', // Viền cam cháy
                overflow: 'hidden'
              }}>
                <div 
                  style={{ 
                    padding: '12px 18px', 
                    color: '#ffffff', 
                    fontWeight: '600', 
                    fontSize: '14px', 
                    textAlign: 'right',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#d97706'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/profile');
                  }}
                >
                  👤 Trang cá nhân
                </div>
                <div 
                  style={{ 
                    padding: '12px 18px', 
                    color: '#ffffff', 
                    fontWeight: '600', 
                    fontSize: '14px', 
                    textAlign: 'right',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#d97706'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/wallet');
                  }}
                >
                  💳 Quản lý Ví
                </div>
                <div 
                  style={{ 
                    padding: '12px 18px', 
                    color: '#ffffff', 
                    fontWeight: '600', 
                    fontSize: '14px', 
                    textAlign: 'right',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#d97706'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/order');
                  }}
                >
                  📦 Đơn hàng đã mua
                </div>
              </div>
            )}
          </div>

          {/* Nút Đăng xuất gốc */}
          <button className="logout-btn" onClick={handleLogout} title="Đăng xuất">
            <LogOut size={18} />
          </button>
          
          {/* Nút Giỏ hàng gốc */}
          <button className="cart-btn" onClick={() => setDrawerOpen(true)}>
            <ShoppingCart size={22} color="rgba(255,255,255,0.85)" />
            {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
          </button>
        </div>
      </nav>
      {/* ── HERO (Giữ nguyên giao diện) ── */}
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="hero-eyebrow">Since 2000 · Đắk Lắk, Việt Nam</div>
            <h1 className="hero-title">Taste the<br /><em>Art of</em><br />Excellence.</h1>
            <p className="hero-sub">Hương vị cà phê nguyên bản từ vùng đất đỏ bazan...</p>
            <button className="hero-cta">Khám phá ngay <ArrowRight size={16} /></button>
          </div>
          <div className="hero-visual">
            <div className="hero-stat-row">
              <div className="hero-stat">
                <div className="hero-stat-num">24+</div>
                <div className="hero-stat-label">Năm kinh nghiệm</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">100%</div>
                <div className="hero-stat-label">Arabica & Robusta</div>
              </div>
            </div>
            {/* ... Feat items ... */}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-label">Thực đơn</div>
            <h2 className="section-title">Bộ sưu tập thượng hạng</h2>
          </div>
          <div className="filter-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-tab${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {filtered.map(item => (
            <div className="product-card" key={item.id}>
              <div className="product-img-wrap">
                <img className="product-img" src={item.imageUrl || 'https://via.placeholder.com/300'} alt={item.name} />
                <div className="product-badge"><Star size={12} /> 4.9</div>
              </div>
              <div className="product-body">
                <div className="product-cat">{item.categoryName || 'Special'}</div>
                <div className="product-name">{item.name}</div>
                <div className="product-footer">
                  <div className="product-price">
                    {/* Sửa lỗi hiển thị giá [cite: 26] */}
                    {getProductPrice(item).toLocaleString('vi-VN')} <small>đ</small>
                  </div>
                  <button className="add-btn" onClick={() => addToCart(item)}><Plus size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CART DRAWER ── */}
      <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`drawer${drawerOpen ? ' open' : ''}`}>
        <div className="drawer-head">
          <span className="drawer-title">Giỏ hàng của bạn</span>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}><X size={16} /></button>
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart size={64} />
              <p>Giỏ hàng trống...</p>
            </div>
          ) : (
            cart.map(item => (
              <div className="cart-item" key={item.id}>
                <img src={item.imageUrl} alt={item.name} />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{getProductPrice(item).toLocaleString('vi-VN')}đ</div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item.id, -1)}><Minus size={12} /></button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, 1)}><Plus size={12} /></button>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeItem(item.id)}><Trash2 size={18} /></button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="total-row">
              <div className="total-label">Tổng thanh toán</div>
              <div className="total-amount">{totalAmount.toLocaleString('vi-VN')}đ</div>
            </div>
            {walletBalance !== null && (
              <div className="wallet-bar">
                <Wallet size={16} />
                Số dư: <strong>{walletBalance.toLocaleString('vi-VN')}đ</strong>
                <button type="button" className="topup-btn" onClick={handleTopUp}>Nạp tiền</button>
              </div>
            )}
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}