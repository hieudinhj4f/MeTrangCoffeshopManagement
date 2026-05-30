import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Progress, Table, Tag, Typography, Button, Spin, message } from 'antd';
import { TrophyOutlined, ArrowLeftOutlined, CrownOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const { Title, Text } = Typography;

const RankDisplay = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState(null);

  useEffect(() => {
    const fetchRankData = async () => {
      try {
        if (!user?.token) {
          message.error('Vui lòng đăng nhập để xem hạng thành viên!');
          navigate('/login');
          return;
        }
        const res = await api.get('/customers/me');
        setCustomerInfo(res.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Rank:", error);
        message.error("Không thể kết nối đến máy chủ hệ thống!");
      } finally {
        setLoading(false);
      }
    };

    fetchRankData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#fcf8f2]">
        <Spin size="large" tip="Đang kiểm tra chứng nhận Rank Mê Trang..." />
      </div>
    );
  }

  // Dữ liệu giả lập cấu trúc các mốc Rank để hiển thị bảng quyền lợi cho Hội đồng chấm điểm
  const rankColumns = [
    {
      title: 'Hạng thành viên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span className="font-bold" style={{ color: record.color }}>{text}</span>
      ),
    },
    {
      title: 'Mốc chi tiêu tích lũy',
      dataIndex: 'milestone',
      key: 'milestone',
      className: 'font-semibold text-gray-600',
    },
    {
      title: 'Ưu đãi đặc quyền',
      dataIndex: 'benefit',
      key: 'benefit',
      render: (text) => <Tag color="orange" className="font-medium px-2 py-0.5 rounded-md">{text}</Tag>,
    },
  ];

  const rankDataSource = [
    { key: '1', name: '🏅 Hạng Đồng', milestone: 'Mặc định khi đăng ký', benefit: 'Tích lũy điểm 1%', color: '#cd7f32', code: 'BRONZE' },
    { key: '2', name: '🥈 Hạng Bạc', milestone: 'Từ 2.000.000đ', benefit: 'Giảm 3% hóa đơn + Tích điểm 2%', color: '#c0c0c0', code: 'SILVER' },
    { key: '3', name: '👑 Hạng Vàng', milestone: 'Từ 5.000.000đ', benefit: 'Giảm 5% hóa đơn + Tích điểm 3%', color: '#ffd700', code: 'GOLD' },
    { key: '4', name: '💎 Hạng Kim Cương', milestone: 'Từ 10.000.000đ', benefit: 'Giảm 10% hóa đơn + Quà sinh nhật VIP', color: '#1e3a8a', colorHex: '#38bdf8', code: 'DIAMOND' },
  ];

  const totalSpent = customerInfo?.totalSpent || 0;
  const currentRankName = customerInfo?.rankName || 'Hạng Đồng';
  
  // Tính toán mốc nâng cấp kế tiếp (Giả sử mục tiêu kế tiếp là mốc 2.000.000đ của Hạng Bạc)
  const nextMilestone = 2000000;
  const missingAmount = Math.max(nextMilestone - totalSpent, 0);
  const progressPercent = Math.min(((totalSpent / nextMilestone) * 100).toFixed(1), 100);

  return (
    <div className="min-h-screen bg-[#fcf8f2] py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* NÚT BACK QUAY LẠI TRANG CHỦ SHOP */}
        <div className="flex justify-between items-center">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/shop')}
            className="text-[#92400e] font-bold hover:text-[#e8631a] flex items-center"
          >
            Quay lại Cửa hàng
          </Button>
          <Text className="text-gray-400 text-xs font-semibold">CẬP NHẬT THEO ĐƠN HÀNG THỰC TẾ</Text>
        </div>

        {/* KHỐI 1: THẺ RANK 3D CỦA KHÁCH HÀNG */}
        <Card 
          className="shadow-2xl rounded-[24px] border-none overflow-hidden relative"
          style={{ 
            background: 'linear-gradient(135deg, #92400e 0%, #451a03 100%)', // Tone màu nâu hạt cà phê đậm sang trọng
            padding: '12px' 
          }}
        >
          {/* Họa tiết vương miện chìm góc phải */}
          <CrownOutlined className="absolute right-6 bottom-4 text-white opacity-5 text-9xl pointer-events-none" />
          
          <Row align="middle" gutter={[24, 24]}>
            <Col xs={24} sm={16} className="text-white">
              <div className="flex items-center gap-3">
                <TrophyOutlined className="text-3xl text-[#f3a638]" />
                <Title level={3} className="text-[#fde68a] m-0 font-extrabold">THÀNH VIÊN MÊ TRANG</Title>
              </div>
              <div className="mt-4">
                <Text className="text-gray-300 block text-xs tracking-widest uppercase">Chủ tài khoản</Text>
                <Text className="text-xl font-bold text-white block mt-0.5">{customerInfo?.fullName || 'Khách hàng'}</Text>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <Text className="text-gray-300 text-sm">Hạng hiện tại của bạn:</Text>
                <span className="text-2xl font-black text-[#f3a638] uppercase drop-shadow-md">
                  {currentRankName}
                </span>
              </div>
            </Col>

            <Col xs={24} sm={8} className="flex justify-center sm:justify-end">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center min-w-[160px] shadow-inner">
                <Text className="text-gray-200 text-xs font-bold block">Tổng chi tiêu</Text>
                <Text className="text-2xl font-black text-[#fde68a] block mt-1">
                  {Number(totalSpent).toLocaleString('vi-VN')}đ
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* KHỐI 2: LỘ TRÌNH THĂNG CẤP */}
        <Card className="shadow-md rounded-[20px] border-none bg-white" title={<span className="text-[#92400e] font-bold text-lg">🎯 Lộ trình thăng cấp Bạc</span>}>
          <div className="p-2">
            <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
              <span>Tiến trình tích lũy:</span>
              <span className="text-[#e8631a]">{progressPercent}%</span>
            </div>
            <Progress 
              percent={progressPercent} 
              strokeColor={{ '0%': '#f3a638', '100%': '#e8631a' }} 
              trailColor="#f3f4f6"
              strokeWidth={14}
              status="active"
            />
            {missingAmount > 0 ? (
              <div className="mt-4 p-3 bg-[#fffbeb] rounded-xl border border-[#fde68a] flex items-center gap-2">
                <CheckCircleOutlined className="text-[#e8631a]" />
                <Text className="text-sm text-[#92400e] font-semibold">
                  Hiếu chỉ cần chi tiêu thêm <span className="text-[#e8631a] font-black">{missingAmount.toLocaleString('vi-VN')}đ</span> để chính thức nâng cấp lên <span className="underline font-bold">Hạng Bạc</span> và hưởng ưu đãi giảm giá hóa đơn!
                </Text>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircleOutlined className="text-emerald-500" />
                <Text className="text-sm text-emerald-800 font-semibold">
                  Chúc mừng bạn đã đạt hoặc vượt mốc tích lũy an toàn cho cấp bậc này!
                </Text>
              </div>
            )}
          </div>
        </Card>

        {/* KHỐI 3: BẢNG QUYỀN LỢI CHI TIẾT CÁC CẤP RANK */}
        <Card className="shadow-md rounded-[20px] border-none bg-white" title={<span className="text-[#92400e] font-bold text-lg">🎁 Bảng đặc quyền VIP Mê Trang</span>}>
          <Table 
            columns={rankColumns} 
            dataSource={rankDataSource} 
            pagination={false}
            bordered={false}
            className="custom-rank-table"
            rowClassName={(record) => currentRankName.includes(record.name.split(' ').pop()) ? 'bg-amber-50/50 font-medium' : ''}
          />
        </Card>

      </div>
    </div>
  );
};

export default RankDisplay;