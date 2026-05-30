import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 1, name: 'All', icon: '🍺' },
  { id: 2, name: 'Coffee', icon: '☕' },
  { id: 3, name: 'Juice', icon: '🍹' },
  { id: 4, name: 'Milk', icon: '🥛' },
  { id: 5, name: 'Snack', icon: '🥪' },
];

const products = [
  { id: 1, name: 'Caramel Frappuccino', price: 3.95, img: 'https://images.unsplash.com/photo-1572286258217-4357754e203c?w=200' },
  { id: 2, name: 'Chocolate Frappuccino', price: 4.51, img: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?w=200' },
];

const Inventory = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#f8f8f8] font-sans text-gray-800">
      
      {/* 1. Sidebar Trái */}
      <div className="w-20 bg-white flex flex-col items-center py-8 border-r border-gray-100">
        <div className="text-[#a67c52] font-bold text-xl mb-12 italic">HLD</div>
        <div className="space-y-8 flex-1">
          <div className="text-gray-400 cursor-pointer">🏠</div>
          <div className="bg-[#a67c52] p-3 rounded-xl text-white shadow-lg cursor-pointer">☕</div>
          <div className="text-gray-400 cursor-pointer">📜</div>
          <div className="text-gray-400 cursor-pointer">⚙️</div>
        </div>
        <button onClick={handleLogout} className="text-gray-400">🚪</button>
      </div>

      {/* 2. Menu Chính (Ở giữa) */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Choose Category</h1>
          <div className="relative">
            <input type="text" placeholder="Search category..." className="pl-10 pr-4 py-2 bg-white rounded-xl shadow-sm outline-none w-64" />
            <span className="absolute left-3 top-2">🔍</span>
          </div>
        </header>

        {/* Categories Bar */}
        <div className="flex gap-4 mb-10">
          {categories.map((cat) => (
            <div key={cat.id} className={`flex flex-col items-center p-4 rounded-2xl w-24 cursor-pointer transition-all ${cat.name === 'Coffee' ? 'bg-[#a67c52] text-white' : 'bg-white text-gray-400 hover:bg-orange-50'}`}>
              <span className="text-2xl mb-2">{cat.icon}</span>
              <span className="text-xs font-semibold">{cat.name}</span>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-6">Coffee Menu <span className="text-gray-400 text-sm ml-2">12 Items</span></h2>
        
        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-6">
          {products.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[30px] shadow-sm relative overflow-hidden">
              <div className="flex gap-4">
                <img src={item.img} alt={item.name} className="w-24 h-24 rounded-2xl object-cover shadow-md" />
                <div>
                  <h3 className="font-bold text-lg mb-1 leading-tight">{item.name}</h3>
                  <p className="text-gray-400 text-xs mb-2 italic">Special syrup with coffee...</p>
                  <span className="text-[#a67c52] font-bold text-lg">${item.price}</span>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-end">
                 <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Size</p>
                    <div className="flex gap-2">
                        {['S', 'M', 'L'].map(s => <button key={s} className={`w-8 h-8 rounded-full text-xs font-bold ${s === 'M' ? 'bg-[#a67c52] text-white' : 'bg-gray-100 text-gray-400'}`}>{s}</button>)}
                    </div>
                 </div>
                 <button className="bg-[#a67c52] text-white text-xs px-6 py-2 rounded-xl font-bold shadow-md hover:bg-orange-800">Add to Billing</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Right Sidebar (Bills & Payment) */}
      <div className="w-96 bg-white p-8 border-l border-gray-100">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">👨‍💼</div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold">I'm a Cashier</p>
            <p className="font-bold text-sm">Nguyen Van Hieu</p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-6 italic">Bills</h2>
        <div className="space-y-6 flex-1 mb-8">
            <div className="flex justify-between items-center">
                <div className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                    <div>
                        <p className="text-sm font-bold">Caramel Frappuccino</p>
                        <p className="text-xs text-gray-400">x 1</p>
                    </div>
                </div>
                <span className="font-bold text-sm text-gray-600">$3.95</span>
            </div>
        </div>

        <div className="border-t border-dashed pt-6 space-y-3 mb-10">
            <div className="flex justify-between text-gray-400 text-sm font-medium"><span>Subtotal</span><span>$18.31</span></div>
            <div className="flex justify-between text-gray-400 text-sm font-medium"><span>Tax (10%)</span><span>$1.83</span></div>
            <div className="flex justify-between text-xl font-bold text-gray-900 mt-4"><span>Total</span><span>$20.14</span></div>
        </div>

        <button className="w-full bg-[#a67c52] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-orange-800 transition-all">
          Print Bills
        </button>
      </div>
    </div>
  );
};

export default Inventory;