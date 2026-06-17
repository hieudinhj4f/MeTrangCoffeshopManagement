import React, { useCallback, useEffect, useState } from 'react';
import { Typography, Row, Col, Button, Tag, Space, Badge, message, Tooltip, Spin } from 'antd';
import { Clock, Flame, CheckCircle, Truck, ChefHat, AlertCircle, ArrowRight } from 'lucide-react';
import dayjs from 'dayjs';
import { getOrders, updateOrderStatus } from '../../../services/orderService';

const { Title, Text } = Typography;

/** Map backend status → kanban column */
const toKanbanStatus = (status) => {
  switch (status) {
    case 'PENDING':
    case 'PAID':
      return 'PENDING';
    case 'PROCESSING':
      return 'PROCESSING';
    case 'SHIPPING':
    case 'SHIPPED':
    case 'DELIVERED':
    case 'COMPLETED':
      return 'COMPLETED';
    case 'COMPLETED':
      return 'COMPLETED';
    default:
      return 'PENDING';
  }
};

const fromKanbanStatus = (kanbanStatus) => {
  switch (kanbanStatus) {
    case 'PENDING':
      return 'PENDING';
    case 'PROCESSING':
      return 'PROCESSING';
    case 'SHIPPING':
      return 'SHIPPING';
    case 'COMPLETED':
      return 'COMPLETED';
    default:
      return kanbanStatus;
  }
};

const mapApiOrder = (order) => ({
  id: order.id,
  displayId: order.id ? String(order.id).slice(0, 8).toUpperCase() : '—',
  customer: order.customerName || 'Khách lẻ',
  items: (order.items || []).map(
    (item) => `${item.quantity}x ${item.productName}`
  ),
  total: Number(order.totalAmount ?? 0),
  status: toKanbanStatus(order.status),
  apiStatus: order.status,
  isPriority: Boolean(order.isPriority),
  time: order.orderDate ? dayjs(order.orderDate) : dayjs(),
});

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(() => {
    setLoading(true);
    getOrders()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setOrders(list.map(mapApiOrder));
      })
      .catch((err) => {
        console.error(err);
        const reason =
          err.response?.data?.reason ||
          (err.response?.status === 401
            ? 'Vui lòng đăng nhập để xem danh sách đơn hàng.'
            : 'Không thể tải danh sách đơn hàng.');
        message.error(reason);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const moveOrder = async (orderId, newKanbanStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    let apiStatus = fromKanbanStatus(newKanbanStatus);
    // PAID orders in the "pending" column should move to PROCESSING, not stay PENDING
    if (newKanbanStatus === 'PROCESSING' && order.apiStatus === 'PAID') {
      apiStatus = 'PROCESSING';
    }

    try {
      const res = await updateOrderStatus(orderId, apiStatus);
      const updated = res.data;
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...mapApiOrder(updated),
              }
            : o
        )
      );
      message.success(`Đã chuyển đơn sang: ${newKanbanStatus}`);
    } catch (err) {
      message.error(err.response?.data?.reason || 'Không thể cập nhật trạng thái đơn.');
    }
  };

  const togglePriority = (orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, isPriority: !o.isPriority } : o
      )
    );
    message.info('Ưu tiên chỉ hiển thị trên giao diện (chưa lưu backend).');
  };

  const getTimeColor = (timeInput) => {
    const diffMinutes = dayjs().diff(timeInput, 'minute');
    if (diffMinutes > 30) return 'text-red-500 bg-red-50';
    if (diffMinutes > 15) return 'text-orange-500 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const OrderCard = ({ order }) => (
    <div
      className={`mb-4 bg-white rounded-2xl p-4 border-2 transition-all shadow-sm hover:shadow-md ${
        order.isPriority ? 'border-orange-400 bg-orange-50/10' : 'border-slate-100'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <Text strong className="text-lg">
            {order.displayId}
          </Text>
          {order.isPriority && (
            <Tag color="volcano" icon={<Flame size={12} />} className="ml-2 font-bold border-none">
              ƯU TIÊN
            </Tag>
          )}
          {order.apiStatus === 'PAID' && (
            <Tag color="green" className="ml-2 text-[10px]">
              Đã thanh toán
            </Tag>
          )}
        </div>
        <div
          className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${getTimeColor(order.time)}`}
        >
          <Clock size={12} /> {dayjs().diff(order.time, 'minute')} phút trước
        </div>
      </div>

      <div className="mb-4">
        <Text
          type="secondary"
          className="text-xs font-bold uppercase tracking-wider block mb-1"
        >
          Khách hàng:{' '}
          <span className="text-slate-700">{order.customer}</span>
        </Text>
        <div className="bg-slate-50 p-2 rounded-lg">
          {order.items.length === 0 ? (
            <Text className="text-sm text-slate-400">Không có chi tiết sản phẩm</Text>
          ) : (
            order.items.map((item, idx) => (
              <Text key={idx} className="block text-sm font-semibold text-slate-600">
                • {item}
              </Text>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-between items-end mt-2 pt-3 border-t border-slate-100">
        <div>
          <Text className="text-[10px] font-bold text-slate-400 uppercase block">
            Tổng thu
          </Text>
          <Text strong className="text-lg text-red-500">
            {order.total.toLocaleString('vi-VN')}đ
          </Text>
        </div>

        <Space>
          {order.status === 'PENDING' && (
            <Tooltip title={order.isPriority ? 'Bỏ ưu tiên' : 'Đẩy lên làm trước'}>
              <Button
                type={order.isPriority ? 'primary' : 'default'}
                danger={order.isPriority}
                icon={<Flame size={16} />}
                onClick={() => togglePriority(order.id)}
              />
            </Tooltip>
          )}

          {order.status === 'PENDING' && (
            <Button
              type="primary"
              className="bg-blue-500 font-bold"
              onClick={() => moveOrder(order.id, 'PROCESSING')}
            >
              DUYỆT ĐƠN <ArrowRight size={16} className="ml-1" />
            </Button>
          )}
          {order.status === 'PROCESSING' && (
            <Button
              type="primary"
              className="bg-green-500 font-bold"
              onClick={() => moveOrder(order.id, 'COMPLETED')}
            >
              HOÀN THÀNH <CheckCircle size={16} className="ml-1" />
            </Button>
          )}
        </Space>
      </div>
    </div>
  );

  const renderColumn = (status, title, icon, colorClass, bgColorClass) => {
    const colOrders = orders
      .filter((o) => o.status === status)
      .sort((a, b) => {
        if (b.isPriority !== a.isPriority) return b.isPriority ? 1 : -1;
        return b.time.valueOf() - a.time.valueOf();
      });

    return (
      <Col span={8}>
        <div
          className={`p-4 rounded-3xl h-[80vh] flex flex-col ${bgColorClass} border ${colorClass} border-opacity-20`}
        >
          <div className="flex justify-between items-center mb-4 px-2">
            <Space className={`font-black text-sm uppercase tracking-widest ${colorClass}`}>
              {icon} {title}
            </Space>
            <Badge
              count={colOrders.length}
              showZero
              color={
                status === 'PENDING' ? '#f59e0b' : status === 'PROCESSING' ? '#3b82f6' : '#10b981'
              }
            />
          </div>

          <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {colOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 opacity-50">
                <CheckCircle size={40} className="mb-2" />
                <Text className="text-xs font-bold uppercase">Trống</Text>
              </div>
            ) : (
              colOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </div>
        </div>
      </Col>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" tip="Đang tải đơn hàng..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh' }}>
      <div
        style={{
          background: '#0a1628',
          padding: '30px 40px',
          borderRadius: '24px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Title
            level={2}
            style={{ color: '#fff', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}
          >
            HÀNG CHỜ ĐIỀU PHỐI
          </Title>
          <Text
            style={{
              color: '#d4af37',
              fontWeight: 500,
              fontSize: '12px',
              letterSpacing: '1px',
            }}
          >
            HỆ THỐNG KIỂM SOÁT TIẾN ĐỘ THỜI GIAN THỰC
          </Text>
        </div>
        <div className="flex gap-4 items-center">
          <Button onClick={loadOrders} className="font-bold">
            Làm mới
          </Button>
          <div className="bg-slate-800/50 px-4 py-2 rounded-xl text-center border border-slate-700">
            <Text className="text-slate-400 text-[10px] uppercase font-bold block">
              Tồn đọng
            </Text>
            <Text className="text-orange-400 text-xl font-black">
              {orders.filter((o) => o.status === 'PENDING').length}
            </Text>
          </div>
          <div className="bg-slate-800/50 px-4 py-2 rounded-xl text-center border border-slate-700">
            <Text className="text-slate-400 text-[10px] uppercase font-bold block">
              Đang xử lý
            </Text>
            <Text className="text-blue-400 text-xl font-black">
              {orders.filter((o) => o.status === 'PROCESSING').length}
            </Text>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <Text className="text-slate-400">Chưa có đơn hàng nào trong hệ thống.</Text>
        </div>
      ) : (
        <Row gutter={24}>
          {renderColumn(
            'PENDING',
            '1. Tiếp nhận & Chờ duyệt',
            <AlertCircle size={18} />,
            'text-orange-600',
            'bg-orange-50/30'
          )}
          {renderColumn(
            'PROCESSING',
            '2. Đang chuẩn bị',
            <ChefHat size={18} />,
            'text-blue-600',
            'bg-blue-50/30'
          )}
          {renderColumn(
            'COMPLETED',
            '3. Đã hoàn thành',
            <CheckCircle size={18} />,
            'text-green-600',
            'bg-green-50/30'
          )}
        </Row>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
            `,
        }}
      />
    </div>
  );
};

export default OrderManagementPage;
