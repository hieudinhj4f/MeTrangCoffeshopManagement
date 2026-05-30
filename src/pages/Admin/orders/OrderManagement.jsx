import React, { useState } from 'react';
import { Table, Tag, Select, Typography, Card, Space, Button, message, Input } from 'antd';
import { Search, Eye, CheckCircle, Clock, Truck, XCircle, Package } from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

const OrderManagementPage = () => {
    const [searchText, setSearchText] = useState('');
    
    // Dữ liệu mẫu (Mock data) - Sau này bạn thay bằng dữ liệu fetch từ axios.get('/api/orders')
    const [orders, setOrders] = useState([
        { id: 'DH-1001', customer: 'Nguyễn Văn A', items: '2x Cà phê đen đá, 1x Trà tắc', total: 65000, status: 'PENDING', time: '10:30 22/05/2026' },
        { id: 'DH-1002', customer: 'Công ty TNHH ABC', items: '5kg Hạt Cafe Robusta', total: 1250000, status: 'PROCESSING', time: '10:15 22/05/2026' },
        { id: 'DH-1003', customer: 'Trần Thị B', items: '1x Sinh tố Bơ, 1x Sinh tố Mãng cầu', total: 50000, status: 'SHIPPING', time: '09:45 22/05/2026' },
        { id: 'DH-1004', customer: 'Lê Văn C', items: '1x Syrup Đào', total: 85000, status: 'COMPLETED', time: '08:00 22/05/2026' }
    ]);

    // Cấu hình UI cho từng loại trạng thái
    const statusConfig = {
        PENDING: { color: 'gold', text: 'Chờ xác nhận', icon: <Clock size={14} /> },
        PROCESSING: { color: 'blue', text: 'Đang chuẩn bị', icon: <Package size={14} /> },
        SHIPPING: { color: 'cyan', text: 'Đang giao hàng', icon: <Truck size={14} /> },
        COMPLETED: { color: 'green', text: 'Hoàn thành', icon: <CheckCircle size={14} /> },
        CANCELLED: { color: 'red', text: 'Đã hủy', icon: <XCircle size={14} /> }
    };

    // Hàm gọi API cập nhật trạng thái khi nhân viên chọn từ Dropdown
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            // Giả lập gọi API Backend: await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
            
            // Cập nhật State cục bộ để giao diện đổi màu ngay lập tức
            setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
            message.success(`Đã cập nhật trạng thái đơn ${orderId} thành công!`);
        } catch (error) {
            message.error("Lỗi khi cập nhật trạng thái!");
        }
    };

    const columns = [
        {
            title: 'MÃ ĐƠN',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <Text strong className="text-slate-700">{text}</Text>
        },
        {
            title: 'KHÁCH HÀNG / THỜI GIAN',
            key: 'customerInfo',
            render: (r) => (
                <div>
                    <Text strong>{r.customer}</Text><br/>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{r.time}</Text>
                </div>
            )
        },
        {
            title: 'SẢN PHẨM',
            dataIndex: 'items',
            key: 'items',
            render: (text) => <Text type="secondary">{text}</Text>
        },
        {
            title: 'TỔNG TIỀN',
            dataIndex: 'total',
            key: 'total',
            render: (amount) => <Text strong style={{ color: '#dc2626' }}>{amount.toLocaleString('vi-VN')}đ</Text>
        },
        {
            title: 'Trạng thái đơn hàng ',
            key: 'status',
            render: (r) => (
                <Select
                    value={r.status}
                    onChange={(val) => handleStatusChange(r.id, val)}
                    style={{ width: 160 }}
                    dropdownMatchSelectWidth={false}
                >
                    {Object.keys(statusConfig).map(key => (
                        <Option key={key} value={key}>
                            <Tag color={statusConfig[key].color} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '6px', margin: 0, padding: '4px 8px' }}>
                                {statusConfig[key].icon} {statusConfig[key].text}
                            </Tag>
                        </Option>
                    ))}
                </Select>
            )
        },
        {
            title: 'THAO TÁC',
            key: 'action',
            render: () => (
                <Button type="text" icon={<Eye size={18} color="#0284c7" />} >
                    Chi tiết
                </Button>
            )
        }
    ];

    const filteredOrders = orders.filter(o => 
        o.id.toLowerCase().includes(searchText.toLowerCase()) || 
        o.customer.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ background: '#0a1628', padding: '40px', borderRadius: '24px', marginBottom: '32px' }}>
                <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>THEO DÕI ĐƠN HÀNG</Title>
                <Text style={{ color: '#d4af37', fontWeight: 500 }}>BỘ PHẬN ĐIỀU PHỐI & NHÂN VIÊN</Text>
            </div>

            <Card bordered={false} style={{ borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '24px', width: '300px' }}>
                    <Input 
                        prefix={<Search size={18} color="#94a3b8" />} 
                        placeholder="Tìm theo mã đơn hoặc khách hàng..." 
                        onChange={e => setSearchText(e.target.value)}
                        style={{ height: '45px', borderRadius: '12px', background: '#f1f5f9', border: 'none' }} 
                    />
                </div>
                
                <Table 
                    columns={columns} 
                    dataSource={filteredOrders} 
                    rowKey="id" 
                    pagination={{ pageSize: 8 }} 
                />
            </Card>
        </div>
    );
};

export default OrderManagementPage;