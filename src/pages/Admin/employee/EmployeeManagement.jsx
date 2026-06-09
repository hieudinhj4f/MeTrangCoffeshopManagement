import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, message, Popconfirm, Card, Typography, Row, Col, Statistic, Avatar, Input, Form } from 'antd';
import { UserCheck, UserX, Search, ShieldCheck, Users, Mail, Phone, Edit3, Key, Plus } from 'lucide-react';
import axios from 'axios';
import EmployeeModal from '../../../components/employee/EmployeeModal';

const { Title, Text } = Typography;

const EmployeeManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://metrangcompanybe.onrender.com/api/users', { withCredentials: true });
            const staffOnly = response.data.filter(u => u.role !== 'CUSTOMER');
            setUsers(staffOnly);
        } catch (error) {
            message.error("Không thể tải danh sách nhân sự!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const handleSubmit = async (values) => {
        try {
            if (editingUser) {
                await axios.put(`https://metrangcompanybe.onrender.com/api/users/${editingUser.id}`, values, { withCredentials: true });
                message.success("Cập nhật thông tin nhân sự thành công!");
            } else {
                await axios.post('https://metrangcompanybe.onrender.com/api/users', values, { withCredentials: true });
                message.success("Thêm nhân viên và tạo tài khoản thành công!");
            }
            setIsModalOpen(false);
            fetchEmployees();
            form.resetFields();
        } catch (error) {
            message.error("Lỗi hệ thống, vui lòng kiểm tra lại!");
        }
    };

    const handleDeactivate = async (id) => {
        try {
            await axios.patch(`https://metrangcompanybe.onrender.com/api/users/${id}/deactivate`, {}, { withCredentials: true });
            message.success("Đã khóa tài khoản nhân viên!");
            fetchEmployees();
        } catch (error) {
            message.error("Lỗi khi thực hiện!");
        }
    };

    const columns = [
        {
            title: 'NHÂN VIÊN',
            key: 'employee',
            render: (_, record) => (
                <Space size="middle">
                    <Avatar 
                        src={record.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${record.username}`} 
                        style={{ backgroundColor: '#0a1628' }} 
                    />
                    <div>
                        <Text strong style={{ display: 'block', color: '#0a1628' }}>{record.fullName?.toUpperCase()}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>@{record.username}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'THÔNG TIN LIÊN LẠC',
            key: 'contact',
            render: (_, record) => (
                <div style={{ fontSize: '13px' }}>
                    <div className="flex items-center gap-2"><Mail size={12}/> {record.email || 'N/A'}</div>
                    <div className="flex items-center gap-2"><Phone size={12}/> {record.phoneNumber || 'N/A'}</div>
                </div>
            ),
        },
        {
            title: 'VAI TRÒ',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                let color = '#0a1628';
                if (role === 'ADMIN') color = '#e8631a';
                if (role === 'ENTERPRISE') color = '#10b981';
                return (
                    <Tag color={color} style={{ fontWeight: 600, border: 'none' }}>
                        {role ? role.toUpperCase() : 'N/A'}
                    </Tag>
                );
            },
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag icon={isActive ? <UserCheck size={12}/> : <UserX size={12}/>} 
                     color={isActive ? 'success' : 'error'}>
                    {isActive ? 'ĐANG LÀM VIỆC' : 'ĐÃ NGHỈ/KHÓA'}
                </Tag>
            ),
        },
        {
            title: 'THAO TÁC',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="text" icon={<Edit3 size={18} color="#0a1628" />} onClick={() => {
                        setEditingUser(record);
                        form.setFieldsValue(record);
                        setIsModalOpen(true);
                    }} />
                    <Button type="text" icon={<Key size={18} color="#9b9690" />} />
                    {record.isActive && (
                        <Popconfirm title="Khóa quyền truy cập của nhân viên này?" onConfirm={() => handleDeactivate(record.id)}>
                            <Button type="text" danger icon={<UserX size={18} />} />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '40px', background: '#f8f7f4', minHeight: '100vh' }}>
            <div style={{ background: '#0a1628', padding: '40px', borderRadius: '24px', marginBottom: '40px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <Space align="center" style={{ marginBottom: '16px' }}>
                        <ShieldCheck color="#e8631a" size={32} />
                        <Text style={{ color: '#e8631a', letterSpacing: '3px', fontWeight: 600, fontSize: '12px' }}>HUMAN RESOURCES MANAGEMENT</Text>
                    </Space>
                    <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>Quản Lý Nhân Sự Mê Trang</Title>
                </div>
                <Users size={200} color="#e8631a" style={{ position: 'absolute', right: '-40px', bottom: '-60px', opacity: 0.1 }} />
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
                <Col span={8}>
                    <Card borderless style={{ borderRadius: '16px' }}>
                        <Statistic title="TỔNG NHÂN VIÊN" value={users.length} prefix={<Users size={20} color="#e8631a" />} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card borderless style={{ borderRadius: '16px' }}>
                        <Statistic title="ĐANG TRỰC" value={users.filter(u => u.isActive).length} valueStyle={{ color: '#52c41a' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card borderless style={{ borderRadius: '16px' }}>
                        <Statistic title="QUẢN TRỊ VIÊN" value={users.filter(u => u.role === 'ADMIN').length} prefix={<ShieldCheck size={20} color="#0a1628" />} />
                    </Card>
                </Col>
            </Row>

            <Card borderless style={{ borderRadius: '24px', boxShadow: '0 2px 20px rgba(10,22,40,0.05)' }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                    <Input prefix={<Search size={18} color="#9b9690" />} placeholder="Tìm nhân viên..." style={{ width: 400, borderRadius: '12px', background: '#f2f1ee', border: 'none', height: '45px' }} />
                    <Button type="primary" icon={<Plus size={18} />} style={{ background: '#0a1628', border: 'none', borderRadius: '12px', height: '45px', padding: '0 24px' }} onClick={() => { setEditingUser(null); form.resetFields(); setIsModalOpen(true); }}>THÊM NHÂN VIÊN MỚI</Button>
                </div>
                <Table columns={columns} dataSource={users} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />
            </Card>

            <EmployeeModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onSave={handleSubmit} editingUser={editingUser} form={form} />
        </div>
    );
};

export default EmployeeManagement;