import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, message, Popconfirm, Card, Typography, Row, Col, Statistic, Avatar, Input, Form } from 'antd';
import { UserCheck, UserX, Search, ShieldCheck, Users, Mail, Phone, Edit3, Key, Plus } from 'lucide-react';
import api from '../../../services/api';
import EmployeeModal from '../../../components/employee/EmployeeModal';

const { Title, Text } = Typography;

const EmployeeManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            message.error("Không thể tải danh sách tài khoản!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const handleSubmit = async (values) => {
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, values);
                message.success("Cập nhật thông tin tài khoản thành công!");
            } else {
                await api.post('/users', values);
                message.success("Thêm tài khoản thành công!");
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
            await api.patch(`/users/${id}/deactivate`, {});
            message.success("Đã khóa tài khoản!");
            fetchEmployees();
        } catch (error) {
            message.error("Lỗi khi thực hiện!");
        }
    };

    const columns = [
        {
            title: 'TÀI KHOẢN',
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
                    <div className="flex items-center gap-2"><Phone size={12}/> {record.phone || 'N/A'}</div>
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
                        <Popconfirm title="Khóa quyền truy cập của tài khoản này?" onConfirm={() => handleDeactivate(record.id)}>
                            <Button type="text" danger icon={<UserX size={18} />} />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const filteredUsers = users.filter(u => {
        const matchName = (u.fullName || "").toLowerCase().includes(searchText.toLowerCase());
        const matchUsername = (u.username || "").toLowerCase().includes(searchText.toLowerCase());
        const matchPhone = (u.phone || "").includes(searchText);
        return matchName || matchUsername || matchPhone;
    });

    return (
        <div style={{ padding: '40px', background: '#f8f7f4', minHeight: '100vh' }}>
            <div style={{ background: '#0a1628', padding: '40px', borderRadius: '24px', marginBottom: '40px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <Space align="center" style={{ marginBottom: '16px' }}>
                        <ShieldCheck color="#e8631a" size={32} />
                        <Text style={{ color: '#e8631a', letterSpacing: '3px', fontWeight: 600, fontSize: '12px' }}>QUẢN LÝ TÀI KHOẢN HỆ THỐNG</Text>
                    </Space>
                    <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>Danh Sách Tài Khoản</Title>
                </div>
                <Users size={200} color="#e8631a" style={{ position: 'absolute', right: '-40px', bottom: '-60px', opacity: 0.1 }} />
            </div>



            <Card borderless style={{ borderRadius: '24px', boxShadow: '0 2px 20px rgba(10,22,40,0.05)' }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                    <Input 
                        prefix={<Search size={18} color="#9b9690" />} 
                        placeholder="Tìm tài khoản..." 
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 400, borderRadius: '12px', background: '#f2f1ee', border: 'none', height: '45px' }} 
                    />
                    <Button type="primary" icon={<Plus size={18} />} style={{ background: '#0a1628', border: 'none', borderRadius: '12px', height: '45px', padding: '0 24px' }} onClick={() => { setEditingUser(null); form.resetFields(); setIsModalOpen(true); }}>THÊM TÀI KHOẢN MỚI</Button>
                </div>
                <Table columns={columns} dataSource={filteredUsers} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />
            </Card>

            <EmployeeModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onSave={handleSubmit} editingUser={editingUser} form={form} />
        </div>
    );
};

export default EmployeeManagement;