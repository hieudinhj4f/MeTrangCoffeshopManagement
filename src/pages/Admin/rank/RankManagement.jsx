import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Card, Typography, Modal, Form, InputNumber, Input, message } from 'antd';
import { Trophy, Edit3, ShieldCheck, ArrowUpCircle, Info, Plus } from 'lucide-react';
import axios from 'axios';

const { Title, Text } = Typography;

const RankManagement = () => {
  const [ranks, setRanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState(null);
  const [form] = Form.useForm();

  // Hàm phụ trợ: Tự động render màu sắc dựa theo tên Hạng (vì DB không lưu mã màu)
  const getRankColor = (rankName) => {
    const name = (rankName || '').toLowerCase();
    if (name.includes('đồng') || name.includes('bronze')) return '#cd7f32';
    if (name.includes('bạc') || name.includes('silver')) return '#c0c0c0';
    if (name.includes('vàng') || name.includes('gold')) return '#ff7a45';
    if (name.includes('kim') || name.includes('diamond')) return '#e8631a';
    return '#0a1628'; // Màu mặc định
  };

  // 1. Lấy dữ liệu Rank từ Backend
  const fetchRanks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/ranks');
      setRanks(res.data);
    } catch (err) {
      message.error("Không thể kết nối đến máy chủ!");
      // Fallback data mẫu nếu API chết
      setRanks([
        { id: 1, rankName: 'Đồng', minPoint: 0, discountRate: 0, description: 'Hạng mặc định' },
        { id: 2, rankName: 'Bạc', minPoint: 1000, discountRate: 3, description: 'Khách hàng thân thiết' },
      ]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRanks(); }, []);

  // 2. Xử lý Lưu (Tạo mới hoặc Cập nhật)
  const handleSave = async (values) => {
    try {
      if (editingRank) {
        await axios.put(`http://localhost:8080/api/ranks/${editingRank.id}`, values);
        message.success("Cập nhật hạng thành công!");
      } else {
        await axios.post('http://localhost:8080/api/ranks', values);
        message.success("Thêm hạng mới thành công!");
      }
      setIsModalOpen(false);
      fetchRanks(); // Reset lại bảng
    } catch (error) {
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  // 3. Định nghĩa các cột (Đã đổi tên biến khớp với Backend Entity)
  const columns = [
    {
      title: 'HẠNG THÀNH VIÊN',
      dataIndex: 'rankName',
      key: 'rankName',
      render: (text) => (
        <Space>
          <div style={{ 
            width: 12, height: 12, borderRadius: '50%', 
            background: getRankColor(text), boxShadow: `0 0 10px ${getRankColor(text)}` 
          }} />
          <Text strong style={{ color: '#0a1628', fontFamily: "'Cormorant Garamond', serif", fontSize: '18px' }}>
            {text ? text.toUpperCase() : ''}
          </Text>
        </Space>
      ),
    },
    {
      title: 'ĐIỂM TỐI THIỂU',
      dataIndex: 'minPoint',
      key: 'minPoint',
      render: (val) => <Text strong>{val?.toLocaleString()} điểm</Text>,
    },
    {
      title: 'ƯU ĐÃI (%)',
      dataIndex: 'discountRate',
      key: 'discountRate',
      render: (pct) => <Tag color="orange" style={{ fontWeight: 700 }}>GIẢM {pct}%</Tag>,
    },
    {
      title: 'MÔ TẢ',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <Text type="secondary" italic>{text}</Text>,
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="text" 
          icon={<Edit3 size={18} color="#e8631a" />} 
          onClick={() => {
            setEditingRank(record);
            form.setFieldsValue(record);
            setIsModalOpen(true); // Fix lỗi undefined chỗ này
          }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '40px', background: '#f8f7f4', minHeight: '100vh' }}>
      {/* Header Panel */}
      <div style={{ 
        background: '#0a1628', padding: '40px', borderRadius: '24px', 
        marginBottom: '40px', position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(10,22,40,0.2)' 
      }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <Space align="center" style={{ marginBottom: '16px' }}>
              <Trophy color="#e8631a" size={32} />
              <Text style={{ color: '#e8631a', letterSpacing: '3px', fontWeight: 600, fontSize: '12px' }}>
                MEMBERSHIP SYSTEM
              </Text>
            </Space>
            <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>
              Quản Lý Hạng Thành Viên
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.5)' }}>
              Thiết lập các mốc chi tiêu và quyền lợi chiết khấu cho khách hàng.
            </Text>
          </div>
          <Button 
            type="primary" 
            size="large"
            icon={<Plus size={18} />} 
            style={{ background: '#e8631a', borderColor: '#e8631a', borderRadius: '12px' }}
            onClick={() => {
              setEditingRank(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Thêm Hạng Mới
          </Button>
        </div>
        <ArrowUpCircle 
          size={180} color="#e8631a" 
          style={{ position: 'absolute', right: '-20px', bottom: '-40px', opacity: 0.1 }} 
        />
      </div>

      {/* Main Content */}
      <Card borderless style={{ borderRadius: '24px', boxShadow: '0 2px 20px rgba(10,22,40,0.05)' }}>
        <Table 
          columns={columns} 
          dataSource={ranks} 
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
        <Card style={{ flex: 1, borderRadius: '16px', border: '1px dashed #d0cec9' }}>
          <Space>
            <ShieldCheck color="#e8631a" />
            <Text italic type="secondary">Tự động thăng hạng khi khách hàng đạt đủ Điểm Tối Thiểu.</Text>
          </Space>
        </Card>
        <Card style={{ flex: 1, borderRadius: '16px', border: '1px dashed #d0cec9' }}>
          <Space>
            <Info color="#122040" />
            <Text italic type="secondary">Chiết khấu được áp dụng trực tiếp vào tổng hóa đơn khi thanh toán.</Text>
          </Space>
        </Card>
      </div>

      {/* Form Modal Thêm/Sửa */}
      <Modal
        title={
          <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#0a1628' }}>
            {editingRank ? 'Chỉnh Sửa Hạng' : 'Thêm Hạng Mới'}
          </Text>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu Thay Đổi"
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#e8631a', borderColor: '#e8631a', borderRadius: '8px' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: '20px' }}>
          <Form.Item 
            label="Tên hạng thành viên" 
            name="rankName" 
            rules={[{ required: true, message: 'Vui lòng nhập tên hạng!' }]}
          >
            <Input placeholder="VD: Vàng, Kim Cương..." size="large" />
          </Form.Item>

          <Form.Item 
            label="Điểm / Chi tiêu tối thiểu" 
            name="minPoint" 
            rules={[{ required: true, message: 'Vui lòng nhập điểm!' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              size="large" 
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item 
            label="Tỉ lệ ưu đãi giảm giá (%)" 
            name="discountRate" 
            rules={[{ required: true, message: 'Vui lòng nhập % giảm giá!' }]}
          >
            <InputNumber style={{ width: '100%' }} size="large" min={0} max={100} suffix="%" />
          </Form.Item>

          <Form.Item label="Mô tả chi tiết" name="description">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm về hạng này..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RankManagement;