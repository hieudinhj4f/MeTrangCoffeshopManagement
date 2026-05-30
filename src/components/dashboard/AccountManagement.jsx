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
            const response = await axios.get('https://metrangcompanybe.onrender.com/api/users', {
                withCredentials: true // Quan trọng để khớp với cấu hình CORS mình vừa sửa
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

    // 2. Hàm vô hiệu hóa tài khoản
    const handleDeactivate = async (id) => {
        try {
            await axios.patch(`https://metrangcompanybe.onrender.com/api/users/${id}/deactivate`, {}, { withCredentials: true });
            message.success("Đã vô hiệu hóa tài khoản!");
            fetchUsers(); // Tải lại danh sách
        } catch (error) {
            message.error("Lỗi khi thực hiện!");
        }
    };

    // 3. Định nghĩa các cột của bảng
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
            render: (role) => (
                <Tag color={role === 'ADMIN' ? 'volcano' : 'green'}>
                    {role ? role.toUpperCase() : 'N/A'}
                </Tag>
            ),
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
                    {record.isActive && (
                        <Popconfirm
                            title="Khóa tài khoản này?"
                            onConfirm={() => handleDeactivate(record.id)}
                        >
                            <Button type="link" danger>Khóa</Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h2>Quản lý tài khoản nhân viên</h2>
            <Table 
                columns={columns} 
                dataSource={users} 
                rowKey="id" // Dùng UUID làm key cho mỗi dòng
                loading={loading} 
            />
        </div>
    );
};
export default AccountManagement;