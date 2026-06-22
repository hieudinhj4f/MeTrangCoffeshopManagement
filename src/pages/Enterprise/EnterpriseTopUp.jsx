import React, { useState, useEffect } from 'react';
import { Card, Form, Select, InputNumber, Button, Table, message, Statistic, Row, Col, Typography, Tag } from 'antd';
import { topUpBulk, getEnterpriseHistory } from '../../services/walletService';
import { getAllUsers } from '../../services/userService';
import { Wallet, Users, ArrowUpRight, Clock } from 'lucide-react';

const { Title, Text } = Typography;

const EnterpriseTopUp = () => {
    const [form] = Form.useForm();
    const [staffs, setStaffs] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalToppedUp, setTotalToppedUp] = useState(0);

    const fetchData = async () => {
        try {
            const [usersRes, historyRes] = await Promise.all([
                getAllUsers(),
                getEnterpriseHistory()
            ]);
            
            const staffUsers = usersRes.data.filter(u => u.role === 'CUSTOMER');
            setStaffs(staffUsers);

            if (historyRes.data?.status === 'Thành công') {
                const histData = historyRes.data.data.filter(t => t.type === 'DEPOSIT');
                setHistory(histData);
                const sum = histData.reduce((acc, curr) => acc + curr.amount, 0);
                setTotalToppedUp(sum);
            }
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu: ' + error.message);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            let targetIds = [];
            if (values.target === 'ALL') {
                targetIds = staffs.map(s => s.id);
            } else {
                targetIds = [values.target];
            }

            if (targetIds.length === 0) {
                message.warning('Không có công nhân nào để nạp tiền');
                return;
            }

            const res = await topUpBulk(targetIds, values.amount, true); // true = isTopUpToCeiling
            if (res.data?.status === 'Thành công') {
                message.success(`Nạp bù định mức thành công cho ${res.data.totalProcessed} công nhân!`);
                form.resetFields();
                fetchData(); // Refresh history
            }
        } catch (error) {
            message.error('Nạp tiền thất bại: ' + (error.response?.data?.reason || error.message));
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => new Date(text).toLocaleString('vi-VN'),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color={type === 'DEPOSIT' ? 'green' : 'red'}>{type}</Tag>
        },
        {
            title: 'Người nạp',
            dataIndex: 'performedByName',
            key: 'performedByName',
            render: (name) => <Tag color="blue">{name || 'Hệ thống'}</Tag>
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => <Text strong type="success">+{amount.toLocaleString('vi-VN')} đ</Text>
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50">
            <div className="mb-8">
                <Title level={2} className="!m-0 text-slate-800 flex items-center gap-3">
                    <Wallet className="w-8 h-8 text-orange-500" />
                    Quản lý nạp tiền nội bộ
                </Title>
                <Text type="secondary">Doanh nghiệp nạp bù định mức trần cho công nhân</Text>
            </div>

            <Row gutter={[24, 24]} className="mb-8">
                <Col xs={24} md={12} lg={8}>
                    <Card 
                        className="shadow-sm rounded-2xl border-none"
                        style={{ background: 'linear-gradient(to bottom right, #f97316, #ea580c)' }}
                    >
                        <Statistic 
                            title={<span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>Tổng tiền đã nạp (VND)</span>}
                            value={totalToppedUp} 
                            formatter={(val) => val.toLocaleString('vi-VN')}
                            valueStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '32px' }}
                            prefix={<ArrowUpRight style={{ opacity: 0.8 }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12} lg={8}>
                    <Card className="shadow-sm rounded-2xl border-none">
                        <Statistic 
                            title={<span className="text-slate-500 font-medium">Số lượt giao dịch</span>}
                            value={history.length} 
                            valueStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                            prefix={<Clock className="text-blue-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12} lg={8}>
                    <Card className="shadow-sm rounded-2xl border-none">
                        <Statistic 
                            title={<span className="text-slate-500 font-medium">Số lượng công nhân đang có</span>}
                            value={staffs.length} 
                            valueStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                            prefix={<Users className="text-green-500" />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card title="Thực hiện Nạp bù Định mức trần" className="shadow-sm rounded-2xl border-none h-full">
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 text-sm">
                            Hệ thống sẽ tính toán chênh lệch và <b>chỉ nạp bù</b> để ví của nhân viên đạt đúng <b>Định mức trần</b> này. Những nhân viên đã dư đủ tiền sẽ không bị nạp thêm.
                        </div>
                        <Form form={form} layout="vertical" onFinish={onFinish}>
                            <Form.Item 
                                name="target" 
                                label={<span className="font-medium text-slate-700">Đối tượng nạp</span>} 
                                rules={[{ required: true, message: 'Vui lòng chọn đối tượng!' }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn công nhân hoặc nạp toàn bộ"
                                    optionFilterProp="children"
                                    className="h-12"
                                >
                                    <Select.Option value="ALL" className="font-bold text-orange-600 bg-orange-50">
                                        🚀 Nạp bù cho TẤT CẢ công nhân
                                    </Select.Option>
                                    {staffs.map(s => (
                                        <Select.Option key={s.id} value={s.id}>
                                            {s.fullName} ({s.username})
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item 
                                name="amount" 
                                label={<span className="font-medium text-slate-700">Định mức trần mỗi nhân viên (VNĐ)</span>} 
                                rules={[{ required: true, message: 'Vui lòng nhập định mức trần!' }]}
                            >
                                <InputNumber 
                                    className="w-full h-12" 
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    min={1000}
                                    step={10000}
                                />
                            </Form.Item>

                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-lg mt-4"
                                loading={loading}
                            >
                                Xác nhận Nạp bù
                            </Button>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card title="Lịch sử giao dịch của Doanh nghiệp" className="shadow-sm rounded-2xl border-none h-full overflow-x-auto">
                        <Table 
                            dataSource={history} 
                            columns={columns} 
                            rowKey="id"
                            pagination={{ pageSize: 6 }}
                            className="custom-table"
                        />
                    </Card>
                </Col>
            </Row>

            <style>{`
                .custom-table .ant-table-thead > tr > th {
                    background-color: #f8fafc;
                    color: #475569;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default EnterpriseTopUp;
