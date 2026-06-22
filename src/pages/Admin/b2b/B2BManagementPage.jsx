import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Input, Modal, Form, InputNumber } from 'antd';
import { Building2, Edit3, Search } from 'lucide-react';
import { adminTopUp } from '../../../services/walletService';
import api from '../../../services/api';

const B2BManagementPage = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form] = Form.useForm();
    const [topUpForm] = Form.useForm();

    const fetchB2BCustomers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/customers/b2b');
            setCustomers(response.data);
        } catch (error) {
            message.error("Không thể tải danh sách doanh nghiệp!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchB2BCustomers();
    }, []);

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        form.setFieldsValue({
            companyName: customer.companyName,
            taxCode: customer.taxCode,
            creditLimit: customer.creditLimit || 0,
            b2bDiscountRate: customer.b2bDiscountRate || 0
        });
        setIsModalOpen(true);
    };

    const handleSave = async (values) => {
        try {
            await api.put(`/customers/b2b/${editingCustomer.id}`, values);
            message.success('Cập nhật thông tin Doanh nghiệp thành công!');
            setIsModalOpen(false);
            fetchB2BCustomers();
        } catch (error) {
            message.error(error.response?.data?.reason || 'Lỗi khi cập nhật!');
        }
    };

    const handleOpenTopUp = (customer) => {
        setEditingCustomer(customer);
        const debt = customer.wallet?.balance && customer.wallet.balance < 0 ? Math.abs(customer.wallet.balance) : 0;
        topUpForm.setFieldsValue({
            amount: debt > 0 ? debt : null
        });
        setIsTopUpModalOpen(true);
    };

    const handleTopUp = async (values) => {
        try {
            await adminTopUp(editingCustomer.id, values.amount);
            message.success('Tất toán/Nạp tiền thành công!');
            setIsTopUpModalOpen(false);
            fetchB2BCustomers();
        } catch (error) {
            message.error(error.response?.data?.reason || 'Lỗi khi nạp tiền!');
        }
    };

    const columns = [
        {
            title: 'DOANH NGHIỆP',
            key: 'enterprise',
            render: (_, record) => (
                <Space size="middle">
                    <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#e8631a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={20} color="#fff" />
                    </div>
                    <div>
                        <strong style={{ color: '#0a1628', display: 'block', fontSize: '14px' }}>
                            {record.companyName || record.fullName || 'Chưa cập nhật'}
                        </strong>
                        <span style={{ color: '#666', fontSize: '12px' }}>MST: {record.taxCode || 'N/A'}</span>
                    </div>
                </Space>
            )
        },
        {
            title: 'LIÊN LẠC',
            key: 'contact',
            render: (_, record) => (
                <div style={{ fontSize: '13px' }}>
                    <div>{record.email || 'N/A'}</div>
                    <div>{record.phoneNumber || 'N/A'}</div>
                </div>
            )
        },
        {
            title: 'SỐ DƯ QUỸ (VNĐ)',
            key: 'balance',
            align: 'right',
            render: (_, record) => (
                <strong style={{ color: '#e8631a' }}>
                    {record.wallet?.balance ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.wallet.balance) : '0 ₫'}
                </strong>
            )
        },
        {
            title: 'HẠN MỨC (VNĐ)',
            dataIndex: 'creditLimit',
            key: 'creditLimit',
            align: 'right',
            render: (limit) => (
                <span style={{ color: '#0a1628', fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(limit || 0)}
                </span>
            )
        },
        {
            title: 'CHIẾT KHẤU (%)',
            dataIndex: 'b2bDiscountRate',
            key: 'discount',
            align: 'center',
            render: (rate) => (
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                    {rate || 0}%
                </span>
            )
        },
        {
            title: 'THAO TÁC',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="primary" 
                        style={{ background: '#10b981', borderColor: '#10b981' }}
                        onClick={() => handleOpenTopUp(record)}
                    >
                        Tất toán
                    </Button>
                    <Button 
                        type="primary" 
                        icon={<Edit3 size={16} />} 
                        style={{ background: '#0a1628' }}
                        onClick={() => handleEdit(record)}
                    >
                        Chỉnh sửa
                    </Button>
                </Space>
            )
        }
    ];

    const filtered = customers.filter(c => 
        (c.companyName || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (c.taxCode || '').includes(searchText)
    );

    return (
        <div style={{ padding: '24px', background: '#f8f7f4', minHeight: '100vh' }}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, color: '#0a1628' }}>
                        QUẢN LÝ ĐỐI TÁC B2B
                    </h2>
                    <Input 
                        prefix={<Search size={16} color="#999" />} 
                        placeholder="Tìm theo Tên công ty, MST..." 
                        style={{ width: 300, borderRadius: '8px' }}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                </div>

                <Table 
                    columns={columns} 
                    dataSource={filtered} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </div>

            <Modal
                title="Chỉnh sửa Thông tin & Chính sách B2B"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText="Lưu thay đổi"
                cancelText="Hủy"
                okButtonProps={{ style: { background: '#e8631a', border: 'none' } }}
            >
                <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: '20px' }}>
                    <Form.Item name="companyName" label="Tên doanh nghiệp">
                        <Input placeholder="Nhập tên doanh nghiệp..." />
                    </Form.Item>
                    <Form.Item name="taxCode" label="Mã số thuế">
                        <Input placeholder="Nhập mã số thuế..." />
                    </Form.Item>
                    
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item name="creditLimit" label="Hạn mức tín dụng (VNĐ)" style={{ flex: 1 }}>
                            <InputNumber 
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                min={0}
                            />
                        </Form.Item>

                        <Form.Item name="b2bDiscountRate" label="Chiết khấu mua hàng (%)" style={{ flex: 1 }}>
                            <InputNumber 
                                style={{ width: '100%' }}
                                min={0}
                                max={100}
                                step={0.1}
                            />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            <Modal
                title={`Tất toán công nợ / Nạp tiền cho ${editingCustomer?.companyName || 'Doanh nghiệp'}`}
                open={isTopUpModalOpen}
                onCancel={() => setIsTopUpModalOpen(false)}
                onOk={() => topUpForm.submit()}
                okText="Xác nhận Tất toán"
                cancelText="Hủy"
                okButtonProps={{ style: { background: '#10b981', border: 'none' } }}
            >
                <div style={{ marginBottom: '16px', background: '#f0fdf4', padding: '12px', borderRadius: '8px', color: '#166534' }}>
                    <strong>Lưu ý:</strong> Hành động này sẽ cộng trực tiếp tiền vào số dư của doanh nghiệp để xóa nợ. Số dư hiện tại:{' '}
                    <strong>{editingCustomer?.wallet?.balance ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(editingCustomer.wallet.balance) : '0 ₫'}</strong>
                </div>
                <Form form={topUpForm} layout="vertical" onFinish={handleTopUp}>
                    <Form.Item 
                        name="amount" 
                        label="Số tiền tất toán/nạp (VNĐ)"
                        rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
                    >
                        <InputNumber 
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            min={1000}
                            step={100000}
                            size="large"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default B2BManagementPage;
