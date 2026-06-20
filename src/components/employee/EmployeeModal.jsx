import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Input, Select, Typography } from 'antd';
import api from '../../services/api';

const { Text } = Typography;

const EmployeeModal = ({ open, onCancel, onSave, editingUser, form }) => {
    const [enterprises, setEnterprises] = useState([]);
    const selectedRole = Form.useWatch('role', form);

    useEffect(() => {
        if (open) {
            api.get('/customers/b2b')
                .then(res => {
                    const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                    setEnterprises(data);
                })
                .catch(err => console.error(err));
        }
    }, [open]);
    return (
        <Modal 
            title={
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#0a1628' }}>
                    {editingUser ? "HIỆU CHỈNH TÀI KHOẢN" : "THÊM TÀI KHOẢN MỚI"}
                </div>
            } 
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            width={700}
            okText="XÁC NHẬN"
            cancelText="HỦY"
            okButtonProps={{ style: { background: '#0a1628', borderRadius: '8px', height: '40px' } }}
        >
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={onSave} 
                style={{ marginTop: '20px' }}
                initialValues={{ role: 'STAFF' }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        {/* fullName khớp với Entity và DB (full_name) */}
                        <Form.Item name="fullName" label={<Text strong>Họ và Tên</Text>} rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                            <Input placeholder="Nguyễn Văn A" style={{ borderRadius: '8px' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        {/* role khớp với Enum trong Java */}
                        <Form.Item name="role" label={<Text strong>Chức vụ (Role)</Text>} rules={[{ required: true }]}>
                            <Select style={{ width: '100%' }}>
                                <Select.Option value="ADMIN">ADMIN</Select.Option>
                                <Select.Option value="ENTERPRISE">DOANH NGHIỆP (ENTERPRISE)</Select.Option>
                                <Select.Option value="WAREHOUSE_KEEPER">THỦ KHO (WAREHOUSE)</Select.Option>
                                <Select.Option value="DISPATCHER">ĐIỀU PHỐI (DISPATCHER)</Select.Option>
                                <Select.Option value="STAFF">NHÂN VIÊN (STAFF)</Select.Option>
                                <Select.Option value="CUSTOMER">KHÁCH HÀNG (CUSTOMER)</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="username" label={<Text strong>Tên đăng nhập</Text>} rules={[{ required: true }]}>
                            <Input placeholder="user123" disabled={!!editingUser} style={{ borderRadius: '8px' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        {/* Password chỉ bắt buộc khi tạo mới */}
                        <Form.Item 
                            name="password" 
                            label={<Text strong>Mật khẩu</Text>} 
                            rules={[{ required: !editingUser, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password placeholder="••••••••" style={{ borderRadius: '8px' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        {/* name="phone" khớp với request.getPhone() ở Java */}
                        <Form.Item name="phone" label={<Text strong>Số điện thoại</Text>}>
                            <Input placeholder="09xxx" style={{ borderRadius: '8px' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="email" label={<Text strong>Email</Text>} rules={[{ type: 'email' }]}>
                            <Input placeholder="example@gmail.com" style={{ borderRadius: '8px' }} />
                        </Form.Item>
                    </Col>
                </Row>

                {selectedRole === 'CUSTOMER' && (
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="enterpriseId" label={<Text strong>Thuộc Doanh nghiệp (B2B)</Text>} rules={[{ required: true, message: 'Vui lòng chọn Doanh nghiệp cho công nhân!' }]}>
                                <Select placeholder="Chọn Doanh nghiệp..." style={{ width: '100%' }}>
                                    {enterprises.map(ent => (
                                        <Select.Option key={ent.id} value={ent.id}>
                                            {ent.companyName} (MST: {ent.taxCode})
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                )}
            </Form>
        </Modal>
    );
};

export default EmployeeModal;