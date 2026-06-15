import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, DatePicker, Table, Tabs, Tag, Progress, Spin, message, Button } from 'antd';
import { 
    DollarSign, ShoppingBag, Wallet, AlertTriangle, 
    TrendingUp, TrendingDown, Clock, Activity, Download
} from 'lucide-react';
import Chart from 'react-apexcharts';
import dayjs from 'dayjs';
// 💡 LƯU Ý: Nếu dự án của bạn dùng axios có chứa Token, hãy import file api của bạn vào đây
// import api from '../utils/api'; 

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const StatisticPage = () => {
    // 1. Quản lý trạng thái (State)
    const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'days'), dayjs()]);
    const [loading, setLoading] = useState(false);

    // State cho Tab Tài chính
    const [financeSummary, setFinanceSummary] = useState(null);
    const [revenueChart, setRevenueChart] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);

    // State cho Tab Vận hành
    const [operationMetrics, setOperationMetrics] = useState(null);
    const [peakHoursChart, setPeakHoursChart] = useState([]);

    // State cho Tab Kho
    const [inventoryAlerts, setInventoryAlerts] = useState([]);
    const [ingredientEfficiency, setIngredientEfficiency] = useState([]);

    // 2. Hàm gọi API lấy dữ liệu
    useEffect(() => {
        const fetchStatistics = async () => {
            if (!dateRange || dateRange.length !== 2) return;
            
            setLoading(true);
            const startDate = dateRange[0].format('YYYY-MM-DD');
            const endDate = dateRange[1].format('YYYY-MM-DD');

            try {
                // ĐANG DÙNG FETCH MẶC ĐỊNH. (Nếu bạn dùng axios thì thay bằng api.get('/api/statistics/finance?...'))
                const [financeRes, operationRes, inventoryRes] = await Promise.all([
                    fetch(`https://metrangcompanybe.onrender.com/api/statistics/finance?startDate=${startDate}&endDate=${endDate}`),
                    fetch(`https://metrangcompanybe.onrender.com/api/statistics/operations?startDate=${startDate}&endDate=${endDate}`),
                    fetch(`https://metrangcompanybe.onrender.com/api/statistics/inventory`)
                ]);

                if (financeRes.ok) {
                    const financeData = await financeRes.json();
                    setFinanceSummary(financeData.summaryMetrics);
                    setRevenueChart(financeData.revenueChart);
                    setPaymentMethods(financeData.paymentMethods);
                }

                if (operationRes.ok) {
                    const opData = await operationRes.json();
                    setOperationMetrics(opData.operationMetrics);
                    setPeakHoursChart(opData.peakHoursChart);
                }

                if (inventoryRes.ok) {
                    const invData = await inventoryRes.json();
                    setInventoryAlerts(invData.lowStockAlerts);
                    setIngredientEfficiency(invData.ingredientEfficiency);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu thống kê:", error);
                message.error("Không thể tải dữ liệu. Vui lòng kiểm tra lại kết nối!");
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [dateRange]); // Tự động chạy lại hàm này mỗi khi bạn đổi bộ lọc ngày

    const handleExportExcel = () => {
        if (!dateRange || dateRange.length !== 2) {
            message.warning("Vui lòng chọn khoảng thời gian");
            return;
        }
        const startDate = dateRange[0].format('YYYY-MM-DD');
        const endDate = dateRange[1].format('YYYY-MM-DD');
        // Sử dụng window.open để tải file
        window.open(`https://metrangcompanybe.onrender.com/api/statistics/export/finance?startDate=${startDate}&endDate=${endDate}`, '_blank');
        message.success("Đang xuất báo cáo Excel...");
    };

    // ================= COMPONENT THẺ CHỈ SỐ =================
    const MetricCard = ({ title, value, subValue, icon, bg, trend, isGood }) => (
        <Card bordered={false} className="shadow-sm hover:shadow-md transition-all rounded-2xl h-full">
            <div className="flex justify-between items-start mb-2">
                <div className={`p-3 rounded-2xl ${bg}`}>{icon}</div>
                {trend && (
                    <div className={`flex items-center gap-1 font-bold text-sm ${isGood ? 'text-green-500' : 'text-red-500'}`}>
                        {isGood ? <TrendingUp size={16} /> : <TrendingDown size={16} />} {trend}
                    </div>
                )}
            </div>
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">{title}</Text>
            <div className="mt-1 flex items-end justify-between">
                <Text className="text-2xl font-black text-slate-800">{value}</Text>
                {subValue && <Text className="text-xs font-semibold text-slate-500 mb-1">{subValue}</Text>}
            </div>
        </Card>
    );

    // ================= TAB 1: TÀI CHÍNH & KINH DOANH =================
    const TabFinance = () => {
        // Cấu hình mảng ngày tháng cho trục X
        const chartCategories = revenueChart.map(item => dayjs(item.dateLabel).format('DD/MM'));
        
        const areaChartOptions = {
            chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
            colors: ['#10b981', '#3b82f6'],
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2 },
            xaxis: { categories: chartCategories },
            yaxis: { 
                labels: { formatter: (val) => `${(val / 1000).toLocaleString('vi-VN')}k` } // Thu gọn số tiền trên trục Y
            },
            tooltip: { y: { formatter: (val) => `${val.toLocaleString('vi-VN')} VNĐ` } }
        };

        // Đổ dữ liệu vào biểu đồ đường
        const areaChartSeries = [
            { name: 'Doanh thu', data: revenueChart.map(item => item.totalRevenue) },
            { name: 'Lợi nhuận', data: revenueChart.map(item => item.grossProfit) }
        ];

        const donutChartOptions = {
            chart: { type: 'donut', fontFamily: 'inherit' },
            labels: paymentMethods.map(item => item.methodName), // Lấy tên các phương thức
            colors: ['#3b82f6', '#10b981', '#f59e0b'],
            legend: { position: 'bottom' },
            plotOptions: { pie: { donut: { size: '65%' } } },
            dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` },
            tooltip: { y: { formatter: (val) => `${val.toFixed(1)}%` } }
        };
        
        // Đổ dữ liệu % vào biểu đồ tròn
        const donutChartSeries = paymentMethods.map(item => item.percentage);

        return (
            <div>
                <Row gutter={[20, 20]} className="mb-6">
                    <Col span={6}>
                        <MetricCard 
                            title="Tổng Doanh Thu" 
                            value={`${financeSummary?.totalRevenue?.toLocaleString('vi-VN') || 0}đ`} 
                            icon={<DollarSign size={24} color="#10b981" />} 
                            bg="bg-green-50" 
                            trend={`+${financeSummary?.revenueTrend || 0}%`} 
                            isGood={true} 
                        />
                    </Col>
                    <Col span={6}>
                        <MetricCard 
                            title="Lợi Nhuận Gộp" 
                            value={`${financeSummary?.grossProfit?.toLocaleString('vi-VN') || 0}đ`} 
                            subValue={`Biên LN: ${financeSummary?.profitMargin || 0}%`} 
                            icon={<Wallet size={24} color="#3b82f6" />} 
                            bg="bg-blue-50" 
                            isGood={true} 
                        />
                    </Col>
                    <Col span={6}>
                        <MetricCard 
                            title="Giá trị TB/Đơn (AOV)" 
                            value={`${financeSummary?.averageOrderValue?.toLocaleString('vi-VN') || 0}đ`} 
                            icon={<ShoppingBag size={24} color="#f59e0b" />} 
                            bg="bg-orange-50" 
                        />
                    </Col>
                    <Col span={6}>
                        <MetricCard 
                            title="Tỉ lệ Hủy/Hoàn tiền" 
                            value={`${financeSummary?.cancelRate || 0}%`} 
                            subValue={`${financeSummary?.canceledOrdersCount || 0} đơn bị hủy`} 
                            icon={<AlertTriangle size={24} color="#ef4444" />} 
                            bg="bg-red-50" 
                            isGood={false} 
                        />
                    </Col>
                </Row>

                <Row gutter={[20, 20]}>
                    <Col span={16}>
                        <Card bordered={false} className="rounded-2xl shadow-sm h-full" title="Biểu đồ Doanh thu & Lợi nhuận">
                            <Chart options={areaChartOptions} series={areaChartSeries} type="area" height={300} width="100%" />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false} className="rounded-2xl shadow-sm h-full" title="Phương thức thanh toán">
                            <Chart options={donutChartOptions} series={donutChartSeries} type="donut" height={320} width="100%" />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    // ================= TAB 2: VẬN HÀNH QUẦY =================
    const TabOperations = () => {
        const barChartOptions = {
            chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
            colors: ['#3b82f6'],
            plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
            dataLabels: { enabled: false },
            xaxis: { categories: peakHoursChart.map(item => item.hour) }, // Lấy khung giờ từ DB
        };

        const barChartSeries = [
            { name: 'Số đơn hàng', data: peakHoursChart.map(item => item.totalOrders) }
        ];

        return (
            <div>
                <Row gutter={[20, 20]} className="mb-6">
                    <Col span={8}><MetricCard title="Thời gian ra món TB" value={`${operationMetrics?.avgPreparationTimeSeconds || 0}s`} icon={<Clock size={24} color="#8b5cf6" />} bg="bg-purple-50" isGood={true} /></Col>
                    <Col span={8}><MetricCard title="Hiệu suất quầy Bar" value={`${operationMetrics?.onTimeRate || 0}%`} subValue="Đơn đúng hạn" icon={<Activity size={24} color="#10b981" />} bg="bg-green-50" isGood={true} /></Col>
                    <Col span={8}><MetricCard title="Sản phẩm lỗi/Đổi trả" value={`${operationMetrics?.defectItemsCount || 0} ly`} subValue="Hao hụt vận hành" icon={<AlertTriangle size={24} color="#f59e0b" />} bg="bg-orange-50" isGood={false} /></Col>
                </Row>
                <Card bordered={false} className="rounded-2xl shadow-sm" title="Bản đồ nhiệt: Lưu lượng khách theo giờ (Peak Hours)">
                    <Chart options={barChartOptions} series={barChartSeries} type="bar" height={300} width="100%" />
                </Card>
            </div>
        );
    };

    // ================= TAB 3: KHO & NGUYÊN LIỆU =================
    const TabInventory = () => (
        <Row gutter={[20, 20]}>
            <Col span={12}>
                <Card bordered={false} className="rounded-2xl shadow-sm h-full" title="Báo động tồn kho (Cần nhập gấp)">
                    <Table 
                        dataSource={inventoryAlerts} 
                        pagination={{ pageSize: 5 }} 
                        rowKey="ingredientId"
                        columns={[
                            { title: 'Nguyên liệu', dataIndex: 'name', key: 'name', render: t => <Text strong>{t}</Text> },
                            { title: 'Tồn thực tế', key: 'remain', render: (_, r) => <Text type="danger" strong>{r.currentStock} {r.unit}</Text> },
                            { title: 'Định mức', key: 'min', render: (_, r) => <Text>{r.minStockLevel} {r.unit}</Text> },
                            { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: s => <Tag color={s==='Nguy cấp'?'red':'orange'}>{s}</Tag> },
                        ]}
                    />
                </Card>
            </Col>
            <Col span={12}>
                <Card bordered={false} className="rounded-2xl shadow-sm h-full" title="Hiệu suất sử dụng nguyên liệu">
                    {ingredientEfficiency.map((item, idx) => (
                         <div className="mb-4" key={idx}>
                            <div className="flex justify-between mb-1"><Text>{item.name}</Text><Text strong>{item.usedPercentage}%</Text></div>
                            <Progress percent={item.usedPercentage} strokeColor={item.usedPercentage > 90 ? "#10b981" : "#3b82f6"} showInfo={false} />
                        </div>
                    ))}
                </Card>
            </Col>
        </Row>
    );

    return (
        <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ background: '#0a1628', padding: '30px 40px', borderRadius: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>TRUNG TÂM PHÂN TÍCH</Title>
                    <Text style={{ color: '#d4af37', fontWeight: 500, fontSize: '12px', letterSpacing: '1px' }}>BÁO CÁO TOÀN DIỆN MỌI CHỈ SỐ</Text>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <RangePicker 
                        value={dateRange} 
                        onChange={setDateRange} 
                        format="DD/MM/YYYY" 
                        style={{ height: '40px', borderRadius: '8px' }} 
                        allowClear={false}
                    />
                    <Button 
                        type="primary" 
                        icon={<Download size={18} />} 
                        onClick={handleExportExcel}
                        style={{ 
                            height: '40px', 
                            borderRadius: '8px', 
                            background: '#10b981', 
                            borderColor: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: '600'
                        }}
                    >
                        Xuất Excel
                    </Button>
                </div>
            </div>
            <Spin spinning={loading} tip="Đang tổng hợp số liệu...">
                <Tabs 
                    defaultActiveKey="1" 
                    type="card"
                    className="custom-tabs"
                    items={[
                        { key: '1', label: 'TÀI CHÍNH & KINH DOANH', children: <TabFinance /> },
                        { key: '2', label: 'VẬN HÀNH QUẦY', children: <TabOperations /> },
                    ]}
                />
            </Spin>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-tabs .ant-tabs-nav::before { border-bottom: none; }
                .custom-tabs .ant-tabs-tab { background: transparent; border: none; font-weight: 600; color: #64748b; padding: 12px 24px; transition: all 0.3s; }
                .custom-tabs .ant-tabs-tab-active { background: #fff !important; color: #0a1628 !important; border-radius: 12px 12px 0 0; border-bottom: 2px solid #0a1628 !important;}
            `}} />
        </div>
    );
};

export default StatisticPage;