import React, { useCallback, useEffect, useState } from 'react';
import { Input, Select, Button, InputNumber, DatePicker, message, Space, Table, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getProducts } from '../../../services/productService';
import { getProductPrice } from '../../../services/api';
import {
  getWarehouse,
  getWarehouseTransactions,
  importStock,
} from '../../../services/warehouseService';

const EMPTY_ROW = { productId: '', sku: '---', unit: '---', quantity: 0, price: 0, total: 0, batchCode: '', expiryDate: dayjs().add(6, 'month') };

const readVndMoney = (amount) => {
  if (amount === 0) return 'Không đồng';
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const places = ['', 'mươi', 'trăm', 'nghìn', 'mươi', 'trăm', 'triệu', 'mươi', 'trăm', 'tỷ'];
  let str = '';
  const numStr = Math.round(amount).toString();
  const len = numStr.length;
  for (let i = 0; i < len; i++) {
    const digit = parseInt(numStr[i], 10);
    const pos = len - i - 1;
    if (digit > 0) str += `${units[digit]} ${places[pos]} `;
  }
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1) + ' đồng chẵn';
};

const TransactionTab = ({ warehouseId }) => {
  const [warehouse, setWarehouse] = useState(null);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [delivererName, setDelivererName] = useState('');
  const [receiptRows, setReceiptRows] = useState([{ ...EMPTY_ROW }]);
  const [receiptDate, setReceiptDate] = useState(dayjs());
  const [discount, setDiscount] = useState(0);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceSymbol, setInvoiceSymbol] = useState('');
  const [vatAmount, setVatAmount] = useState(0);

  const loadTransactions = useCallback(() => {
    if (!warehouseId) return;
    setLoadingTx(true);
    getWarehouseTransactions(warehouseId)
      .then((res) => setTransactions(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error(err);
        setTransactions([]);
      })
      .finally(() => setLoadingTx(false));
  }, [warehouseId]);

  useEffect(() => {
    getProducts()
      .then((res) => {
        setProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error(err);
        message.error('Không thể tải danh sách sản phẩm.');
      });
  }, []);

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);

  useEffect(() => {
    import('../../../services/api').then(({ default: api }) => {
      api.get('/suppliers')
        .then((res) => setSuppliers(Array.isArray(res.data) ? res.data : []))
        .catch((err) => console.error('Không tải được nhà cung cấp', err));
    });
  }, []);

  useEffect(() => {
    if (!warehouseId) {
      setWarehouse(null);
      return;
    }
    getWarehouse(warehouseId)
      .then((res) => setWarehouse(res.data))
      .catch((err) => console.error('Không tải được thông tin kho:', err));
    loadTransactions();
  }, [warehouseId, loadTransactions]);

  const findProduct = (productId) =>
    products.find((p) => Number(p.id) === Number(productId));

  const handleProductChange = (productId, index) => {
    const selectedProd = findProduct(productId);
    if (!selectedProd) return;

    const updatedRows = [...receiptRows];
    const price = getProductPrice(selectedProd);
    updatedRows[index] = {
      ...updatedRows[index],
      productId: selectedProd.id,
      sku: selectedProd.sku || String(selectedProd.id),
      unit: selectedProd.unit || 'Cái',
      price,
      total: updatedRows[index].quantity * price,
    };
    setReceiptRows(updatedRows);
  };

  const handleValueChange = (value, field, index) => {
    const updatedRows = [...receiptRows];
    updatedRows[index][field] = Number(value) || 0;
    updatedRows[index].total = updatedRows[index].quantity * updatedRows[index].price;
    setReceiptRows(updatedRows);
  };

  const handleTextChange = (value, field, index) => {
    const updatedRows = [...receiptRows];
    updatedRows[index][field] = value;
    setReceiptRows(updatedRows);
  };

  const addRow = () => {
    setReceiptRows([...receiptRows, { ...EMPTY_ROW }]);
  };

  const removeRow = (index) => {
    if (receiptRows.length === 1) {
      message.warning('Phiếu nhập kho phải có ít nhất một mặt hàng!');
      return;
    }
    setReceiptRows(receiptRows.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setReceiptRows([{ ...EMPTY_ROW }]);
    setDelivererName('');
    setSelectedSupplierId(null);
    setReceiptDate(dayjs());
    setDiscount(0);
    setInvoiceNumber('');
    setInvoiceSymbol('');
    setVatAmount(0);
  };

  const totalReceiptValue = receiptRows.reduce((sum, row) => sum + row.total, 0);
  const finalTotalValue = Math.max(totalReceiptValue - discount, 0);
  const totalQty = receiptRows.reduce((sum, row) => sum + row.quantity, 0);

  const handleConfirmAndPrint = async () => {
    if (!warehouseId) {
      message.warning('Vui lòng chọn kho ở thanh điều hướng phía trên.');
      return;
    }
    if (!delivererName.trim()) {
      message.warning('Vui lòng nhập họ tên người giao hàng.');
      return;
    }
    if (!selectedSupplierId) {
      message.warning('Vui lòng chọn Nhà Cung Cấp.');
      return;
    }

    const hasInvalidRow = receiptRows.some((row) => !row.productId || row.quantity <= 0);
    if (hasInvalidRow) {
      message.error('Vui lòng chọn đầy đủ sản phẩm và số lượng nhập lớn hơn 0!');
      return;
    }

    const payload = {
      delivererName,
      supplierId: selectedSupplierId,
      warehouseId: Number(warehouseId),
      createdDate: receiptDate.format('YYYY-MM-DDTHH:mm:ss'),
      discount,
      invoiceNumber,
      invoiceSymbol,
      vatAmount,
      items: receiptRows.map((row) => ({
        productId: Number(row.productId),
        quantity: row.quantity,
        price: row.price,
        batchCode: row.batchCode || 'TEMP-BATCH',
        expiryDate: row.expiryDate ? row.expiryDate.format('YYYY-MM-DD') : dayjs().add(6, 'month').format('YYYY-MM-DD')
      })),
    };

    try {
      const response = await importStock(payload);
      message.success(response.data || 'Lưu phiếu nhập kho thành công!');
      loadTransactions();
      setTimeout(() => window.print(), 500);
      resetForm();
    } catch (error) {
      const errBody = error.response?.data;
      const errMsg =
        typeof errBody === 'string'
          ? errBody
          : errBody?.reason || 'Lỗi khi lưu phiếu nhập kho vào Database!';
      message.error(errMsg);
    }
  };

  const currentWarehouseName = warehouse?.name || 'Kho đang chọn';

  const transactionColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'IMPORT' ? 'green' : 'orange'}>
          {type === 'IMPORT' ? 'Nhập' : 'Xuất'}
        </Tag>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, row) => (
        <div>
          <p className="text-xs font-bold text-slate-700 m-0">{row.productName}</p>
          <p className="text-[10px] text-slate-400 m-0">SKU: {row.productSku || '—'}</p>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'staffName',
      key: 'staffName',
    },
  ];

  if (!warehouseId) {
    return (
      <p className="text-slate-400 text-xs font-medium italic py-12 text-center">
        Chọn kho ở thanh trên để xem nhật ký và tạo phiếu nhập.
      </p>
    );
  }

  return (
    <>
      <style>{`
        @media screen {
          .print-bill-layout { display: none !important; }
        }
        @media print {
          .web-screen-layout,
          aside, nav, header,
          .ant-layout-sider, .ant-layout-header,
          .no-print-screen {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          .print-bill-layout {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            font-family: 'Times New Roman', Times, serif !important;
            color: #000000 !important;
            padding: 5mm !important;
            background: #ffffff !important;
          }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          table, th, td { border: 1px solid #000000 !important; }
          th, td { padding: 6px 8px; font-size: 13px; text-align: left; }
          .text-center { text-align: center !important; }
          .text-right { text-align: right !important; }
        }
      `}</style>

      <div className="web-screen-layout space-y-10">
        <section>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-slate-800 font-black text-lg uppercase tracking-tight">
                Nhật ký Nhập/Xuất
              </h3>
              <p className="text-slate-400 text-[10px] font-medium italic">
                Kho: {currentWarehouseName}
                {warehouse?.address ? ` — ${warehouse.address}` : ''}
              </p>
            </div>
            <Button size="small" onClick={loadTransactions} loading={loadingTx}>
              Làm mới
            </Button>
          </div>
          <Table
            rowKey={(row, idx) =>
              `${row.type}-${row.productSku}-${row.createdAt}-${idx}`
            }
            columns={transactionColumns}
            dataSource={transactions}
            loading={loadingTx}
            pagination={{ pageSize: 8 }}
            locale={{ emptyText: 'Chưa có giao dịch nhập/xuất tại kho này.' }}
            size="small"
          />
        </section>

        <section className="border-t border-slate-100 pt-8 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                Tạo Phiếu Nhập Kho
              </h2>
              <p className="text-slate-400 text-xs font-semibold tracking-wider mt-1">
                MẪU SỐ: 01 - VT — {currentWarehouseName}
              </p>
            </div>
            <div className="text-right text-xs font-bold text-slate-400 space-y-1">
              <p>Số: <span className="text-orange-500">NK-DRAFT</span></p>
              <div className="flex items-center gap-2 mt-1 justify-end">
                <span>Ngày:</span>
                <DatePicker
                  value={receiptDate}
                  onChange={(date) => setReceiptDate(date || dayjs())}
                  format="DD/MM/YYYY"
                  allowClear={false}
                  size="small"
                  className="font-bold w-28"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Nhà cung cấp
              </label>
              <Select
                showSearch
                placeholder="Chọn Nhà Cung Cấp..."
                value={selectedSupplierId}
                onChange={setSelectedSupplierId}
                optionFilterProp="label"
                options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                className="w-full h-12 rounded-xl text-sm font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Người giao hàng
              </label>
              <Input
                placeholder="Họ và tên..."
                value={delivererName}
                onChange={(e) => setDelivererName(e.target.value)}
                className="h-12 rounded-xl border-slate-100 bg-slate-50/50 text-sm font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Nhập tại kho
              </label>
              <Input
                readOnly
                value={currentWarehouseName}
                className="h-12 rounded-xl bg-slate-50 text-sm font-semibold text-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Số Hóa Đơn (Tùy chọn)
              </label>
              <Input
                placeholder="Ví dụ: 0001234"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="h-12 rounded-xl border-slate-100 bg-slate-50/50 text-sm font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Ký hiệu HĐ (Tùy chọn)
              </label>
              <Input
                placeholder="Ví dụ: 1C23TDD"
                value={invoiceSymbol}
                onChange={(e) => setInvoiceSymbol(e.target.value)}
                className="h-12 rounded-xl border-slate-100 bg-slate-50/50 text-sm font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Thuế VAT (VNĐ)
              </label>
              <InputNumber
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                className="w-full h-12 rounded-xl text-sm font-semibold pt-1"
                value={vatAmount}
                onChange={(val) => setVatAmount(Number(val) || 0)}
                placeholder="Tiền thuế..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-orange-50/30 border border-orange-100 p-4 rounded-xl">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Tổng tiền hàng
              </p>
              <h3 className="text-xl font-bold text-slate-700 mt-1">
                {totalReceiptValue.toLocaleString('vi-VN')} đ
              </h3>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Tiền CK
              </p>
              <InputNumber
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                className="w-full mt-1 rounded-lg font-bold text-red-500"
                value={discount}
                onChange={(val) => setDiscount(Number(val) || 0)}
                placeholder="Nhập tiền CK..."
              />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                Thanh toán thực tế
              </p>
              <h1 className="text-2xl font-black text-orange-500 mt-1">
                {finalTotalValue.toLocaleString('vi-VN')} đ
              </h1>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-[3fr_1fr_1fr_2fr_2fr_1.5fr_1.5fr_1fr] gap-4 border-b border-slate-100 pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest items-center">
              <div>
                Tên vật phẩm
                <div className="mt-1 font-normal text-xs normal-case text-slate-500">
                  <label className="cursor-pointer flex items-center gap-1">
                    <input type="checkbox" checked={showAllProducts} onChange={e => setShowAllProducts(e.target.checked)} />
                    Hiển thị tất cả SP
                  </label>
                </div>
              </div>
              <div className="text-center">Mã SKU</div>
              <div className="text-center">ĐVT</div>
              <div className="text-center">Mã lô</div>
              <div className="text-center">Hạn SD</div>
              <div className="text-center">Thực nhập</div>
              <div className="text-center">Đơn giá</div>
              <div className="text-right">Thành tiền</div>
            </div>

            <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto pr-2 mt-2">
              {receiptRows.map((row, index) => {
                const availableProducts = showAllProducts ? products : products.filter(p => p.isIngredient === true);
                
                return (
                <div
                  key={index}
                  className="grid grid-cols-[3fr_1fr_1fr_2fr_2fr_1.5fr_1.5fr_1fr] gap-4 items-center py-4 hover:bg-slate-50/30 group"
                >
                  <div>
                    <Select
                      showSearch
                      className="w-full text-sm font-semibold"
                      placeholder="Chọn sản phẩm..."
                      optionFilterProp="label"
                      value={row.productId || undefined}
                      onChange={(val) => handleProductChange(val, index)}
                      options={availableProducts.map((p) => ({
                        value: p.id,
                        label: `${p.name} (${p.sku || p.id})`,
                      }))}
                    />
                  </div>
                  <div className="text-center text-xs font-bold text-slate-400 bg-slate-50 py-2 rounded-lg">
                    {row.sku}
                  </div>
                  <div className="text-center text-xs font-bold text-slate-400">
                    {row.unit}
                  </div>
                  <div className="text-center">
                    <Input
                      placeholder="Mã lô..."
                      value={row.batchCode}
                      onChange={(e) => handleTextChange(e.target.value, 'batchCode', index)}
                      className="w-full text-center rounded-lg font-bold text-xs"
                    />
                  </div>
                  <div className="text-center">
                    <DatePicker
                      value={row.expiryDate}
                      onChange={(date) => handleTextChange(date, 'expiryDate', index)}
                      format="DD/MM/YYYY"
                      allowClear={false}
                      className="w-full text-center rounded-lg font-bold text-xs"
                    />
                  </div>
                  <div className="text-center">
                    <InputNumber
                      min={0}
                      className="w-full rounded-lg text-center font-bold"
                      value={row.quantity}
                      onChange={(val) => handleValueChange(val, 'quantity', index)}
                    />
                  </div>
                  <div className="text-center">
                    <InputNumber
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      className="w-full rounded-lg text-center font-bold text-slate-700"
                      value={row.price}
                      onChange={(val) => handleValueChange(val, 'price', index)}
                    />
                  </div>
                  <div className="text-right text-xs font-black text-slate-700 flex items-center justify-end gap-2">
                    <span>{row.total.toLocaleString('vi-VN')}đ</span>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => removeRow(index)}
                    />
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-100">
            <Space>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addRow}
                className="rounded-xl font-bold h-11"
              >
                Thêm dòng
              </Button>
            </Space>
            <Space size="middle">
              <Button size="large" className="rounded-2xl font-bold px-8 h-12" onClick={resetForm}>
                HỦY
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<PrinterOutlined />}
                onClick={handleConfirmAndPrint}
                className="rounded-2xl font-black px-8 h-12 bg-slate-900 border-none hover:bg-orange-500"
              >
                XÁC NHẬN & IN
              </Button>
            </Space>
          </div>
        </section>
      </div>

      <div className="print-bill-layout">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
            <p><strong>CÔNG TY TNHH MÊ TRANG COFFEE</strong></p>
            <p>Tên kho: {currentWarehouseName}</p>
            <p>Số ĐT hệ thống: 0985 053 068</p>
            <p style={{ marginTop: '5px' }}><strong>Người giao hàng:</strong> {delivererName}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>PHIẾU NHẬP KHO</h2>
            <p style={{ fontStyle: 'italic', fontSize: '12px', marginTop: '3px' }}>
              Ngày {receiptDate.format('DD')} tháng {receiptDate.format('MM')} năm{' '}
              {receiptDate.format('YYYY')}
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px' }}>
            <p><strong>Số PX:</strong> NK-DRAFT</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th className="text-center" style={{ width: '5%' }}>Stt</th>
              <th className="text-center" style={{ width: '10%' }}>Mã hàng</th>
              <th style={{ width: '25%' }}>Tên hàng hóa</th>
              <th className="text-center" style={{ width: '5%' }}>Đvt</th>
              <th className="text-center" style={{ width: '10%' }}>Mã lô</th>
              <th className="text-center" style={{ width: '15%' }}>HSD</th>
              <th className="text-center" style={{ width: '10%' }}>Số lượng</th>
              <th className="text-right" style={{ width: '10%' }}>Đơn giá</th>
              <th className="text-right" style={{ width: '10%' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {receiptRows.map((row, idx) => {
              const productName = findProduct(row.productId)?.name || '---';
              return (
                <tr key={idx}>
                  <td className="text-center">{idx + 1}</td>
                  <td className="text-center">{row.sku}</td>
                  <td>{productName}</td>
                  <td className="text-center">{row.unit}</td>
                  <td className="text-center">{row.batchCode || 'TEMP-BATCH'}</td>
                  <td className="text-center">{row.expiryDate ? row.expiryDate.format('DD/MM/YYYY') : '---'}</td>
                  <td className="text-center">{row.quantity}</td>
                  <td className="text-right">{row.price.toLocaleString('vi-VN')}</td>
                  <td className="text-right">{row.total.toLocaleString('vi-VN')}</td>
                </tr>
              );
            })}
            <tr>
              <td colSpan="5" style={{ fontWeight: 'bold' }}>Tổng cộng</td>
              <td className="text-center" style={{ fontWeight: 'bold' }} />
              <td className="text-center" style={{ fontWeight: 'bold' }}>{totalQty}</td>
              <td style={{ fontWeight: 'bold' }}>Tiền hàng:</td>
              <td className="text-right" style={{ fontWeight: 'bold' }}>
                {totalReceiptValue.toLocaleString('vi-VN')}
              </td>
            </tr>
            <tr>
              <td colSpan="6" style={{ border: 'none' }} />
              <td colSpan="2" style={{ fontWeight: 'bold' }}>Tiền CK:</td>
              <td className="text-right" style={{ fontWeight: 'bold', color: 'red' }}>
                {discount.toLocaleString('vi-VN')}
              </td>
            </tr>
            <tr>
              <td colSpan="6" style={{ border: 'none' }} />
              <td colSpan="2" style={{ fontWeight: 'bold' }}>Thanh toán:</td>
              <td className="text-right" style={{ fontWeight: 'bold' }}>
                {finalTotalValue.toLocaleString('vi-VN')}
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{ marginTop: '12px', fontStyle: 'italic', fontSize: '13px' }}>
          Số tiền viết bằng chữ:{' '}
          <span style={{ fontWeight: 'bold' }}>{readVndMoney(finalTotalValue)}</span>
        </p>
      </div>
    </>
  );
};

export default TransactionTab;
