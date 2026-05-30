import React, { useEffect, useState } from 'react';
import { Input, Select, Button, InputNumber, DatePicker, message, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';

// Hàm helper chuyển đổi số tiền thành chữ (Phục vụ dòng "Số tiền viết bằng chữ" cuối phiếu)
const readVndMoney = (amount) => {
  if (amount === 0) return "Không đồng";
  const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const places = ["", "mươi", "trăm", "nghìn", "mươi", "trăm", "triệu", "mươi", "trăm", "tỷ"];
  
  let str = "";
  let numStr = Math.round(amount).toString();
  let len = numStr.length;

  for (let i = 0; i < len; i++) {
    let digit = parseInt(numStr[i]);
    let pos = len - i - 1;

    if (digit > 0) {
      str += units[digit] + " " + places[pos] + " ";
    }
  }
  return str.trim().charAt(0).toUpperCase() + str.trim().slice(1) + " đồng chẵn";
};

const WarehouseFormTemplate = ({ type = 'IMPORT' }) => {
  const isImport = type === 'IMPORT';

  const config = {
    title: isImport ? 'PHIẾU NHẬP KHO' : 'PHIẾU XUẤT KHO', // Khớp chữ in hoa
    codePrefix: isImport ? 'NK' : 'PX',
    partnerLabel: isImport ? 'Người giao:' : 'Người nhận:',
    partnerPlaceholder: isImport ? 'Họ và tên người giao...' : 'Họ và tên người nhận...',
    qtyLabel: isImport ? 'Thực nhập' : 'Thực xuất',
    apiEndpoint: isImport ? '/admin/warehouse/import' : '/admin/warehouse/export',
    submitText: isImport ? 'XÁC NHẬN & NHẬP KHO' : 'XÁC NHẬN & XUẤT KHO',
    themeColor: isImport ? 'bg-slate-900 hover:bg-orange-500' : 'bg-orange-600 hover:bg-orange-700'
  };

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [partnerName, setPartnerName] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [receiptDate, setReceiptDate] = useState(dayjs());
  const [discount, setDiscount] = useState(0); // Tiền CK
  const [rows, setRows] = useState([
    { productId: '', name: '---', sku: '---', uom: '---', quantity: 1, price: 0, total: 0 }
  ]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [warehouseRes, productRes] = await Promise.all([
          api.get('/admin/warehouses'),
          api.get('/products')
        ]);
        setWarehouses(warehouseRes.data);
        setProducts(productRes.data);
        if (warehouseRes.data.length > 0) {
          setSelectedWarehouse(warehouseRes.data[0].id);
        }
      } catch (error) {
        message.error("Lỗi đồng bộ danh mục từ cơ sở dữ liệu!");
      }
    };
    fetchInitialData();
  }, []);

  const handleProductChange = (productId, index) => {
    const selectedProd = products.find(p => p.id === productId);
    if (!selectedProd) return;

    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      productId: selectedProd.id,
      name: selectedProd.name,
      sku: selectedProd.sku || selectedProd.id.slice(0, 5).toUpperCase(), // Mã hàng ngắn gọn
      uom: selectedProd.uom || 'Thùng', // Khớp Đvt mẫu
    };
    setRows(updatedRows);
  };

  const handleValueChange = (value, field, index) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = Number(value) || 0;
    updatedRows[index].total = updatedRows[index].quantity * updatedRows[index].price;
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([...rows, { productId: '', name: '---', sku: '---', uom: '---', quantity: 1, price: 0, total: 0 }]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const totalQty = rows.reduce((sum, row) => sum + row.quantity, 0); // Tổng số lượng hàng bán
  const totalReceiptValue = rows.reduce((sum, row) => sum + row.total, 0); // Tiền hàng
  const finalTotalValue = Math.max(totalReceiptValue - discount, 0); // Thanh toán

  const handleConfirmAction = async () => {
    if (!partnerName.trim()) {
      message.warning(`Vui lòng điền thông tin đối tác tên ${config.partnerLabel.toLowerCase()}`);
      return;
    }

    const payload = {
      delivererName: partnerName,
      warehouseId: Number(selectedWarehouse),
      createdDate: receiptDate.format('YYYY-MM-DDTHH:mm:ss'),
      discount: discount,
      items: rows.map(row => ({
        productId: row.productId,
        quantity: row.quantity,
        price: row.price
      }))
    };

    try {
      await api.post(config.apiEndpoint, payload);
      message.success("Hệ thống đã lưu thông tin và đồng bộ kho hàng thành công!");
      
      // 🖨️ Kích hoạt lệnh in ngay lập tức
      setTimeout(() => {
        window.print();
      }, 500);

    } catch (error) {
      message.error("Lỗi đồng bộ lưu dữ liệu phiếu kho!");
    }
  };

  const currentWarehouseObj = warehouses.find(w => w.id === selectedWarehouse) || {};

  return (
    <>
      {/* ─── 🖨️ ĐOẠN CSS MEDIA PRINT ÉP ĐỊNH DẠNG THEO ẢNH PHIẾU THỰC TẾ ─── */}
      <style>{`
        @media screen {
          .print-only-bill { display: none !important; }
        }
        @media print {
          .no-print-screen { display: none !important; }
          .print-only-bill { 
            display: block !important; 
            font-family: 'Times New Roman', Times, serif !important;
            color: #000000 !important;
            padding: 10mm !important;
            background: #ffffff !important;
          }
          body { background: #ffffff !important; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          table, th, td { border: 1px solid #000000 !important; }
          th, td { padding: 6px 8px; font-size: 13px; text-align: left; }
          .text-center { text-align: center !important; }
          .text-right { text-align: right !important; }
        }
      `}</style>

      {/* ─── MÀN HÌNH CHÍNH 1: GIAO DIỆN WEB HIỂN THỊ ĐỂ NHẬP LIỆU (ẨN KHI IN) ─── */}
      <div className="no-print-screen min-h-screen bg-slate-50/50 p-6 flex justify-center items-start">
        <div className="w-full max-w-7xl bg-white rounded-3xl shadow-sm border border-slate-100 p-10 space-y-8 relative overflow-hidden">
          {/* Form nhập liệu của Hiếu giữ nguyên như file cũ... */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">{config.title}</h2>
              <p className="text-slate-400 text-xs font-semibold tracking-wider mt-1">MẪU SỐ: 01 - VT (TT 200/2014/TT-BTC)</p>
            </div>
            <div className="text-right text-xs font-bold text-slate-400 space-y-2 flex flex-col items-end">
              <div>Số PX: <span className="text-orange-500">{config.codePrefix}-HD25/011391</span></div>
              <div className="flex items-center gap-2">
                <span>Ngày lập:</span>
                <DatePicker value={receiptDate} onChange={(date) => setReceiptDate(date)} format="DD/MM/YYYY" allowClear={false} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{config.partnerLabel}</label>
              <Input placeholder={config.partnerPlaceholder} value={partnerName} onChange={(e) => setPartnerName(e.target.value)} className="h-12 rounded-xl border-slate-100 bg-slate-50/50 text-sm font-semibold text-slate-700" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Kho bãi thực hiện</label>
              <Select className="w-full h-12 text-sm font-semibold text-slate-700" value={selectedWarehouse} onChange={setSelectedWarehouse}>
                {warehouses.map(w => <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>)}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 border border-slate-100 p-5 rounded-2xl">
            <div className="flex flex-col justify-center"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiền hàng:</span><span className="text-xl font-bold text-slate-700 mt-1">{totalReceiptValue.toLocaleString('vi-VN')} đ</span></div>
            <div className="flex flex-col justify-center md:px-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiền CK:</span><InputNumber min={0} className="w-full mt-1 font-bold text-red-500 rounded-lg" value={discount} onChange={(val) => setDiscount(Number(val) || 0)} /></div>
            <div className="flex flex-col justify-center md:pl-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-orange-600">Thanh toán:</span><span className="text-2xl font-black text-orange-500 mt-1">{finalTotalValue.toLocaleString('vi-VN')} đ</span></div>
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-12 gap-4 border-b border-slate-100 pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="col-span-4">Tên hàng hóa</div>
              <div className="col-span-2 text-center">Mã hàng</div>
              <div className="col-span-1 text-center">Đvt</div>
              <div className="col-span-2 text-center">{config.qtyLabel}</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-1 text-right">Thành tiền</div>
            </div>
            <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto mt-2 pr-2">
              {rows.map((row, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center py-4 group">
                  <div className="col-span-4"><Select showSearch className="w-full text-sm font-semibold" placeholder="Chọn mặt hàng..." optionFilterProp="children" value={row.productId || undefined} onChange={(val) => handleProductChange(val, index)}>{products.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}</Select></div>
                  <div className="col-span-2 text-center text-xs font-bold text-slate-400 bg-slate-50 py-2 rounded-lg">{row.sku}</div>
                  <div className="col-span-1 text-center text-xs font-bold text-slate-400">{row.uom}</div>
                  <div className="col-span-2 text-center"><InputNumber min={1} className="w-full rounded-lg text-center font-bold" value={row.quantity} onChange={(val) => handleValueChange(val, 'quantity', index)} /></div>
                  <div className="col-span-2 text-center"><InputNumber min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} className="w-full rounded-lg text-center font-bold" value={row.price} onChange={(val) => handleValueChange(val, 'price', index)} /></div>
                  <div className="col-span-1 text-right text-xs font-black text-slate-700 flex items-center justify-end gap-2"><span>{row.total.toLocaleString('vi-VN')}đ</span><Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeRow(index)} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-100">
            <Button type="dashed" icon={<PlusOutlined />} onClick={addRow} className="rounded-xl font-bold h-11 px-5">Thêm dòng vật tư</Button>
            <Space size="middle">
              <Button size="large" className="rounded-2xl font-bold px-8 h-12 text-slate-400" onClick={() => setRows([{ productId: '', name: '---', sku: '---', uom: '---', quantity: 1, price: 0, total: 0 }])}>HỦY PHIẾU</Button>
              <Button type="primary" size="large" icon={<PrinterOutlined />} onClick={handleConfirmAction} className={`rounded-2xl font-black px-8 h-12 border-none text-white shadow-md tracking-wide ${config.themeColor}`}>{config.submitText}</Button>
            </Space>
          </div>
        </div>
      </div>

      {/* ─── 🖨️ MÀN HÌNH CHÍNH 2: BIỂU MẪU CHUẨN IN ẤN (CHỈ HIỂN THỊ KHI IN) ─── */}
      <div className="print-only-bill">
        {/* Phần Header phiếu thông tin Công ty */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '14px', lineHeight: '1.3' }}>
            <p><strong>CÔNG TY TNHH MÊ TRANG COFFEE</strong></p>
            <p>Tên cửa hàng: Chi nhánh {currentWarehouseObj.name || 'Nha Trang'}</p>
            <p>Địa chỉ: {currentWarehouseObj.address || '66 Hùng Vương, Lộc Thọ, Nha Trang'}</p>
            <p>Số ĐT: 0985 053 068</p>
            <p>{config.partnerLabel} {partnerName}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>{config.title}</h2>
            <p style={{ fontStyle: 'italic', fontSize: '13px', marginTop: '4px' }}>Ngày {receiptDate.format('DD')} tháng {receiptDate.format('MM')} năm {receiptDate.format('YYYY')}</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '13px' }}>
            <p><strong>Số PX:</strong> HD25/011391</p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '14px', margin: '15px 0 5px' }}>Khách hàng vui lòng kiểm hàng trước khi thanh toán</p>

        {/* Bảng danh sách sản phẩm chuẩn khung lưới đen trắng */}
        <table>
          <thead>
            <tr>
              <th className="text-center" style={{ width: '5%' }}>Stt</th>
              <th className="text-center" style={{ width: '15%' }}>Mã hàng</th>
              <th style={{ width: '40%' }}>Tên hàng hóa</th>
              <th className="text-center" style={{ width: '10%' }}>Đvt</th>
              <th className="text-center" style={{ width: '10%' }}>Số lượng</th>
              <th className="text-right" style={{ width: '10%' }}>Đơn giá</th>
              <th className="text-right" style={{ width: '10%' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="text-center">{idx + 1}</td>
                <td className="text-center">{row.sku}</td>
                <td>{row.name}</td>
                <td className="text-center">{row.uom}</td>
                <td className="text-center">{row.quantity.toFixed(1)}</td>
                <td className="text-right">{row.price.toLocaleString('vi-VN')}</td>
                <td className="text-right">{row.total.toLocaleString('vi-VN')}</td>
              </tr>
            ))}
            {/* Hàng tính tổng cộng theo cấu trúc tờ giấy */}
            <tr>
              <td colSpan="3" style={{ fontWeight: 'bold' }}>Tổng cộng theo:</td>
              <td className="text-center" style={{ fontWeight: 'bold' }}>Thùng</td>
              <td className="text-center" style={{ fontWeight: 'bold' }}>{totalQty.toFixed(1)}</td>
              <td style={{ fontWeight: 'bold' }}>Tiền hàng:</td>
              <td className="text-right" style={{ fontWeight: 'bold' }}>{totalReceiptValue.toLocaleString('vi-VN')}</td>
            </tr>
            <tr>
              <td colSpan="4" style={{ border: 'none' }}></td>
              <td colSpan="2" style={{ fontWeight: 'bold' }}>Tiền CK:</td>
              <td className="text-right" style={{ fontWeight: 'bold', color: 'red' }}>{discount.toLocaleString('vi-VN')}</td>
            </tr>
            <tr>
              <td colSpan="4" style={{ border: 'none' }}></td>
              <td colSpan="2" style={{ fontWeight: 'bold' }}>Thanh toán:</td>
              <td className="text-right" style={{ fontWeight: 'bold' }}>{finalTotalValue.toLocaleString('vi-VN')}</td>
            </tr>
          </tbody>
        </table>

        {/* Số tiền viết bằng chữ */}
        <p style={{ marginTop: '10px', fontStyle: 'italic', fontSize: '14px' }}>
          Số tiền viết bằng chữ: <span style={{ fontWeight: 'bold' }}>{readVndMoney(finalTotalValue)}</span>
        </p>

        {/* Ngày tháng ký tên chân trang */}
        <div style={{ textAlign: 'right', fontStyle: 'italic', marginTop: '15px', fontSize: '13px' }}>
          Ngày {receiptDate.format('DD')} tháng {receiptDate.format('MM')} năm {receiptDate.format('YYYY')}
        </div>

        {/* Khối 4 vị trí chữ ký */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>
          <div>
            <p>NGƯỜI LẬP</p>
            <p style={{ fontStyle: 'italic', fontWeight: 'normal', fontSize: '11px', color: '#666' }}>(Ký, họ tên)</p>
          </div>
          <div>
            <p>NGƯỜI GIAO HÀNG</p>
            <p style={{ fontStyle: 'italic', fontWeight: 'normal', fontSize: '11px', color: '#666' }}>(Ký, họ tên)</p>
          </div>
          <div>
            <p>NGƯỜI NHẬN HÀNG</p>
            <p style={{ fontStyle: 'italic', fontWeight: 'normal', fontSize: '11px', color: '#666' }}>(Ký, họ tên)</p>
          </div>
          <div style={{ paddingRight: '20px' }}>
            <p>THỦ KHO</p>
            <p style={{ fontStyle: 'italic', fontWeight: 'normal', fontSize: '11px', color: '#666' }}>(Ký, họ tên)</p>
            <br /><br /><br />
            <p style={{ marginTop: '30px' }}>Lê Thị Hòa</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default WarehouseFormTemplate;