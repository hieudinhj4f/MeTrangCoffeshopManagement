import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Avatar, Tag, Progress, Statistic, Button, Spin, message } from 'antd';
import { UserOutlined, WalletOutlined, TrophyOutlined, ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { getMyBalance } from '../../../services/walletService';

const NEXT_RANK_MILESTONE = 5_000_000;

const ProfilePage = () => {
  const { user, logout, getCustomerId } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfileAndWallet = async () => {
      if (!user?.token) {
        message.error('Vui lòng đăng nhập để xem hồ sơ');
        navigate('/login');
        return;
      }

      try {
        const [customerRes, walletRes] = await Promise.all([
          api.get('/customers/me'),
          getMyBalance(),
        ]);

        setProfileData({
          customer: customerRes.data,
          wallet: {
            balance: walletRes.data.balance,
            rank: walletRes.data.rank,
          },
        });
      } catch (error) {
        console.error('Profile load error:', error);
        const reason = error.response?.data?.reason || 'Không thể tải thông tin profile';
        message.error(reason);
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndWallet();
  }, [user, logout, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#fcf8f2]">
        <Spin size="large" tip="Đang tải hồ sơ..." />
      </div>
    );
  }

  const { customer, wallet } = profileData || {};
  const rankName = customer?.rankName || wallet?.rank || 'Chưa có hạng';

  return (
    <div className="min-h-screen bg-[#fcf8f2] py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/shop')}
          className="text-[#92400e] font-bold hover:text-[#e8631a]"
        >
          Quay lại Cửa hàng
        </Button>

        <Card className="shadow-xl rounded-[24px] border-none overflow-hidden">
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} sm={6} className="flex justify-center">
              <Avatar size={100} icon={<UserOutlined />} className="bg-[#e8631a]" />
            </Col>
            <Col xs={24} sm={18}>
              <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                <h2 className="text-2xl font-bold text-[#92400e] m-0">
                  {customer?.fullName || user?.username || 'Khách hàng'}
                </h2>

              </div>
              <p className="text-gray-400 text-center sm:text-left mt-1 text-xs">
                @{user?.username} · ID: {getCustomerId()?.slice(0, 8)}...
              </p>


            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card className="shadow-md rounded-[20px] border-none text-center h-full bg-white flex flex-col justify-center py-6">
              <Statistic
                title={<span className="text-gray-500 font-bold text-base">Số dư ví</span>}
                value={wallet?.balance ?? 0}
                precision={0}
                styles={{ content: { color: '#e8631a', fontSize: '36px', fontWeight: '800' } }}
                prefix={<WalletOutlined className="mr-2" />}
                suffix="đ"
              />
              <div className="mt-4 flex gap-2 justify-center">
                <Button
                  type="primary"
                  className="bg-[#e8631a] hover:bg-[#92400e] border-none h-10 px-6 font-bold rounded-xl"
                  onClick={() => navigate('/shop')}
                >
                  Mua hàng
                </Button>

              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              className="shadow-md rounded-[20px] border-none h-full bg-white"
              title={<span className="text-[#92400e] font-bold text-lg">Thông tin liên hệ</span>}
            >
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-500">Số điện thoại:</span>
                  <span className="font-medium text-gray-800">{customer?.phoneNumber || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-500">Email:</span>
                  <span className="font-medium text-gray-800">{customer?.email || 'Chưa cập nhật'}</span>
                </div>

              </div>
            </Card>
          </Col>
        </Row>

        <div className="flex justify-center pt-4">
          <Button
            danger
            type="text"
            icon={<LogoutOutlined />}
            className="font-semibold text-base"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
