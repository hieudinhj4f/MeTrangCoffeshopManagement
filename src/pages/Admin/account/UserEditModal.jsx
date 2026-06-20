import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import axios from 'axios';

const UserEditModal = ({ open, onClose, user, mode = 'ADMIN', onSuccess }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && user) {
            form.setFieldsValue({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || (mode === 'ENTERPRISE' ? 'CUSTOMER' : ''),
                password: '' // empty password by default
            });
        }
    }, [open, user, form, mode]);

    const handleSave = async (values) => {
        try {
            // Nếu là Enterprise, bắt buộc gửi lên role CUSTOMER
            if (mode === 'ENTERPRISE') {
                values.role = 'CUSTOMER';
            }

            await axios.put(`https://metrangcompanybe.onrender.com/api/users/${user.id}`, values, {
                withCredentials: true
            });
            message.success('Cập nhật tài khoản thành công!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Update error:', error);
            message.error(error.response?.data?.reason || 'Lỗi khi cập nhật tài khoản!');
        }
    };

    return (
        <Modal
            title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Chỉnh sửa thông tin tài khoản</span>}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            okButtonProps={{ style: { background: '#f97316', borderColor: '#f97316' } }}
        >
            <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: '20px' }}>
                <Form.Item
                    name="fullName"
                    label="Họ và Tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                >
                    <Input placeholder="Nhập họ và tên..." />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="phone" label="Số điện thoại" style={{ flex: 1 }}>
                        <Input placeholder="Nhập SĐT..." />
                    </Form.Item>

                    <Form.Item name="email" label="Email" style={{ flex: 1 }}>
                        <Input type="email" placeholder="Nhập Email..." />
                    </Form.Item>
                </div>

                <Form.Item name="role" label="Vai trò (Role)" rules={[{ required: true }]}>
                    <Select disabled={mode === 'ENTERPRISE'}>
                        <Select.Option value="CUSTOMER">Công nhân (WORKER/CUSTOMER)</Select.Option>
                        <Select.Option value="ADMIN">Quản trị viên (ADMIN)</Select.Option>
                        <Select.Option value="STAFF">Thu ngân (STAFF)</Select.Option>
                        <Select.Option value="WAREHOUSE_KEEPER">Thủ kho (WAREHOUSE_KEEPER)</Select.Option>
                        <Select.Option value="DISPATCHER">Điều phối viên (DISPATCHER)</Select.Option>
                        <Select.Option value="ENTERPRISE">Doanh nghiệp (ENTERPRISE)</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Mật khẩu mới (Để trống nếu không đổi)"
                >
                    <Input.Password placeholder="Nhập mật khẩu mới nếu muốn thay đổi..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UserEditModal;
