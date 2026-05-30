import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Tag, Space, Card, Typography, Row, Col, Statistic, Progress } from 'antd';
import { Truck, Plus, Search, PhoneCall, Wallet, PackageCheck, Edit3 } from 'lucide-react';
import axios from 'axios';

const { Title, Text } = Typography;

const SupplierPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [form] = Form.useForm();

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/suppliers', {
                withCredentials: true 
            });
            setSuppliers(response.data);
        } catch (error) {
            message.error("Không thể tải dữ liệu nhà cung cấp!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleSubmit = async (values) => {
        try {
            if (editingSupplier) {
                await axios.put(`http://localhost:8080/api/suppliers/${editingSupplier.id}`, values, { withCredentials: true });
                message.success("Cập nhật thành công!");
            } else {
                await axios.post('http://localhost:8080/api/suppliers', values, { withCredentials: true });
                message.success("Thêm nhà cung cấp thành công!");
            }
            setIsModalOpen(false);
            setEditingSupplier(null);
            form.resetFields();
            fetchSuppliers();
        } catch (error) {
            message.error("Đã xảy ra lỗi, vui lòng kiểm tra lại!");
        }
    };

    const columns = [
        {
            title: 'NHÀ CUNG CẤP',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div style={{ padding: '8px 0' }}>
                    <Text strong style={{ fontSize: '16px', color: '#0a1628', display: 'block', fontFamily: "'Cormorant Garamond', serif" }}>
                        {text.toUpperCase()}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>MST: {record.taxCode || 'N/A'}</Text>
                </div>
            ),
        },
        {
            title: 'LIÊN HỆ',
            key: 'contact',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: '13px' }}>{record.contactName}</Text>
                    <Text style={{ fontSize: '12px' }}>
                        <PhoneCall size={12} style={{ marginRight: 4, display: 'inline' }} />
                        {record.phoneNumber}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'HIỆU SUẤT',
            key: 'rating',
            render: () => (
                <div style={{ width: 100 }}>
                    <Text size="small" style={{ fontWeight: 600, color: '#ff7a45' }}>Tin cậy</Text>
                    <Progress percent={90} size="small" strokeColor="#ff7a45" showInfo={false} />
                </div>
            ),
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'error'} style={{ borderRadius: '4px', fontWeight: 600 }}>
                    {isActive ? 'ĐANG HỢP TÁC' : 'NGỪNG NHẬP'}
                </Tag>
            ),
        },
        {
            title: 'THAO TÁC',
            key: 'action',
            render: (_, record) => (
                <Button 
                    type="text" 
                    icon={<Edit3 size={18} color="#e8631a" />} 
                    onClick={() => {
                        setEditingSupplier(record);
                        form.setFieldsValue(record);
                        setIsModalOpen(true);
                    }}
                />
            ),
        },
    ];

    return (
        <div style={{ padding: '40px', background: '#f8f7f4', minHeight: '100vh' }}>
            <div style={{ 
                background: '#0a1628', padding: '40px', borderRadius: '24px', 
                marginBottom: '40px', position: 'relative', overflow: 'hidden' 
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <Space align="center" style={{ marginBottom: '16px' }}>
                        <Truck color="#e8631a" size={32} />
                        <Text style={{ color: '#e8631a', letterSpacing: '3px', fontWeight: 600, fontSize: '12px' }}>
                            MÊ TRANG SUPPLY CHAIN
                        </Text>
                    </Space>
                    <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>
                        Hệ Thống Nhà Cung Cấp
                    </Title>
                </div>
                <Truck size={200} color="#e8631a" style={{ position: 'absolute', right: '-40px', bottom: '-60px', opacity: 0.1 }} />
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
                <Col span={8}>
                    <Card borderless style={{ borderRadius: '16px' }}>
                        <Statistic title="TỔNG ĐỐI TÁC" value={suppliers.length} prefix={<PackageCheck size={20} color="#e8631a" />} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card borderless style={{ borderRadius: '16px' }}>
                        <Statistic 
                            title="ĐANG HỢP TÁC" 
                            value={suppliers.filter(s => s.isActive).length} 
                            valueStyle={{ color: '#52c41a' }} 
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card borderless style={{ borderRadius: '16px' }}>
                        <Statistic title="TỔNG DƯ NỢ" value={0} suffix="đ" prefix={<Wallet size={20} color="#ff4d4f" />} />
                    </Card>
                </Col>
            </Row>

            <Card borderless style={{ borderRadius: '24px', boxShadow: '0 2px 20px rgba(10,22,40,0.05)' }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                    <Input 
                        prefix={<Search size={18} color="#9b9690" />} 
                        placeholder="Tìm đối tác hoặc MST..." 
                        style={{ width: 400, borderRadius: '12px', background: '#f2f1ee', border: 'none', height: '45px' }}
                    />
                    <Button 
                        type="primary" 
                        icon={<Plus size={18} />} 
                        onClick={() => {
                            setEditingSupplier(null);
                            form.resetFields();
                            setIsModalOpen(true);
                        }}
                        style={{ background: '#0a1628', border: 'none', borderRadius: '12px', height: '45px', padding: '0 24px' }}
                    >
                        THÊM ĐỐI TÁC MỚI
                    </Button>
                </div>

                <Table 
                    columns={columns} 
                    dataSource={suppliers}
                    loading={loading}
                    rowKey="id" 
                    pagination={{ pageSize: 8 }}
                />
            </Card>

            <Modal 
                title={<div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px' }}>{editingSupplier ? "CẬP NHẬT ĐỐI TÁC" : "THÊM ĐỐI TÁC MỚI"}</div>} 
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                width={650}
                okText="XÁC NHẬN"
                cancelText="HỦY"
                okButtonProps={{ style: { background: '#0a1628', borderRadius: '8px' } }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: '20px' }}>
                    <Form.Item name="name" label="Tên nhà cung cấp" rules={[{ required: true }]}>
                        <Input placeholder="Ví dụ: Công ty Cafe Mê Trang" style={{ borderRadius: '8px' }} />
                    </Form.Item>
                    
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="contactName" label="Người liên hệ">
                                <Input placeholder="Tên đại diện" style={{ borderRadius: '8px' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="phoneNumber" label="Số điện thoại">
                                <Input placeholder="0258..." style={{ borderRadius: '8px' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="email" label="Email">
                        <Input type="email" placeholder="email@metrang.com.vn" style={{ borderRadius: '8px' }} />
                    </Form.Item>

                    <Form.Item name="taxCode" label="Mã số thuế">
                        <Input placeholder="Nhập MST" style={{ borderRadius: '8px' }} />
                    </Form.Item>

                    <Form.Item name="address" label="Địa chỉ trụ sở">
                        <Input.TextArea rows={2} style={{ borderRadius: '8px' }} />
                    </Form.Item>

                    <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
                        <Tag color="orange">Trạng thái mặc định: Đang hợp tác</Tag>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SupplierPage;