import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, message, Popconfirm } from 'antd';
import api from '../../../services/api';
import UserEditModal from './UserEditModal';

const AccountManagement = ({ mode = 'ADMIN' }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // 1. Hàm gọi API lấy danh sách user  
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const endpoint = mode === 'ENTERPRISE' 
                ? '/users/enterprise/workers'
                : '/users';
                
            const response = await api.get(endpoint);
            setUsers(response.data);
        } catch (error) {
            message.error("Không thể tải danh sách tài khoản!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [mode]);

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const columns = [
        {
            title: 'Tên tài khoản',
            dataIndex: 'username',
            key: 'username',
            render: (text) => <b>{text}</b>,
        },
        {
            title: 'Họ và Tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text) => text || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Chưa cập nhật</span>
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                let color = 'green';
                if (role === 'ADMIN') color = 'volcano';
                if (role === 'ENTERPRISE') color = 'geekblue';
                return (
                    <Tag color={color}>
                        {role ? role.toUpperCase() : 'N/A'}
                    </Tag>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'blue' : 'red'}>
                    {isActive ? 'Đang hoạt động' : 'Đã khóa'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" size="small" onClick={() => handleEdit(record)} style={{ background: '#f97316', borderColor: '#f97316' }}>
                        <i className="fas fa-edit mr-1"></i> Sửa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h2>{mode === 'ENTERPRISE' ? 'Quản lý tài khoản công nhân' : 'Quản lý tài khoản'}</h2>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
            />
            
            <UserEditModal 
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={editingUser}
                mode={mode}
                onSuccess={fetchUsers}
            />
        </div>
    );
};
export default AccountManagement;