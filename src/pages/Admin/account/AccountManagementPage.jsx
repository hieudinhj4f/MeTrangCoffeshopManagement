import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, message, Popconfirm } from 'antd';
import axios from 'axios';

const AccountManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Hàm gọi API lấy danh sách user  
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://metrangcompanybe.onrender.com', {
                withCredentials: true
            });
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
    }, []);



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
                    <Button type="link" onClick={() => message.info(`Sửa ID: ${record.id}`)}>
                        Sửa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h2>Quản lý tài khoản</h2>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
            />
        </div>
    );
};
export default AccountManagement;