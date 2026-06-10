import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, message, Tag, Space, Card, Typography, Row, Col, Select, InputNumber, Avatar, Upload } from 'antd';
import { Coffee, Plus, Search, Edit3, Trash2, Image as ImageIcon, Percent, Filter, UploadCloud, Loader2, Tag as TagIcon } from 'lucide-react';
import axios from 'axios';


const { Title, Text } = Typography;
const { Option } = Select;

const ProductManagementPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [form] = Form.useForm();

    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://metrangcompanybe.onrender.com/api/products', { withCredentials: true });
            setProducts(response.data);
        } catch (error) {
            message.error("Lỗi kết nối dữ liệu!");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchProducts(); }, []);

    const categories = useMemo(() => {
        const uniqueCats = [];
        const map = new Map();
        
        products.forEach(p => {
            const catId = p.categoryId || 0;
            const catName = p.categoryName || 'Chưa phân loại';
            
            if (!map.has(catId)) {
                map.set(catId, true);
                uniqueCats.push({ id: catId, name: catName });
            }
        });
        return uniqueCats;
    }, [products]);

    const filteredData = products.filter(p => {
        const matchSearch = (p.name || "").toLowerCase().includes(searchText.toLowerCase()) || 
                            (p.sku || "").toLowerCase().includes(searchText.toLowerCase());
        const matchCategory = selectedCategory ? p.categoryId === selectedCategory : true;
        return matchSearch && matchCategory;
    });

    const handleCloudinaryUpload = async ({ file, onSuccess, onError }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'hieudinh');

        setUploading(true);
        try {
            const response = await axios.post(
                'https://api.cloudinary.com/v1_1/dmbhwdjua/image/upload', 
                formData
            );
            
            const secureUrl = response.data.secure_url;
            setImageUrl(secureUrl); 
            form.setFieldsValue({ imageUrl: secureUrl }); 
            
            onSuccess(response.data);
            message.success('Tải ảnh lên mây Cloudinary thành công!');
        } catch (error) {
            console.error('Lỗi upload:', error);
            onError(error);
            message.error('Tải ảnh thất bại, vui lòng kiểm tra lại cấu hình!');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (values) => {
        setLoading(true);
        try {
            await axios.post('https://metrangcompanybe.onrender.com/api/products/quick-add', values, { withCredentials: true });
            message.success("Cấu hình sản phẩm thành công!");
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            message.error(error.response?.data?.reason || "Lỗi lưu dữ liệu!");
        } finally { setLoading(false); }
    };

    const columns = [
        {
            title: 'SẢN PHẨM',
            key: 'productInfo',
            render: (r) => (
                <Space>
                    <Avatar 
                        src={r.imageUrl} 
                        shape="square" 
                        size={54} 
                        icon={<ImageIcon size={24} color="#94a3b8" />}
                        style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <div>
                        <Text strong style={{ fontSize: '15px' }}>{r.name}</Text>
                        <br/><Text type="secondary" style={{ fontSize: '11px' }}>Mã SKU: {r.sku}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'DANH MỤC',
            dataIndex: 'categoryName',
            render: (cat) => <Tag color="gold" style={{ borderRadius: '4px', fontWeight: 'bold' }}>{cat?.toUpperCase() || 'LINH KIỆN'}</Tag>
        },
        {
            title: 'GIÁ NIÊM YẾT',
            key: 'priceInfo',
            render: (r) => (
                <div>
                    <Text strong>{r.basePrice?.toLocaleString()}đ</Text> 
                </div>
            )
        },
        {
            title: 'QUẢN LÝ',
            key: 'action',
            render: (r) => (
                <Space>


                    <Button type="text" icon={<Edit3 size={18} color="#d4af37" />} onClick={() => { 
                        setEditingProduct(r); 
                        form.setFieldsValue(r); 
                        setImageUrl(r.imageUrl || ''); 
                        setIsModalOpen(true); 
                    }} />
                    
                    <Button type="text" danger icon={<Trash2 size={18} />} />
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ background: '#0a1628', padding: '40px', borderRadius: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>DANH MỤC HÀNG HÓA</Title>
                    <Text style={{ color: '#d4af37', fontWeight: 500 }}>B2B & RETAIL MANAGEMENT</Text>
                </div>
                <Button type="primary" icon={<Plus size={20} />} onClick={() => { 
                    setEditingProduct(null); 
                    form.resetFields(); 
                    setImageUrl(''); 
                    setIsModalOpen(true); 
                }} style={{ background: '#d4af37', border: 'none', height: '50px', borderRadius: '12px', fontWeight: 'bold' }}>
                    THIẾT LẬP MỚI
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Row gutter={16} style={{ marginBottom: '24px' }}>
                    <Col span={10}>
                        <Input 
                            prefix={<Search size={18} color="#94a3b8" />} 
                            placeholder="Tìm tên hoặc mã sản phẩm..." 
                            onChange={e => setSearchText(e.target.value)}
                            style={{ height: '45px', borderRadius: '12px', background: '#f1f5f9', border: 'none' }} 
                        />
                    </Col>
                    <Col span={6}>
                        <Select 
                            placeholder="Tất cả danh mục" 
                            allowClear 
                            onChange={setSelectedCategory}
                            style={{ width: '100%', height: '45px' }}
                        >
                            {categories.map(cat => (
                                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                            ))}
                        </Select>
                    </Col>
                </Row>

                <Table columns={columns} dataSource={filteredData} loading={loading} rowKey="id" pagination={{ pageSize: 8 }} />
            </Card>

            <Modal
                title={editingProduct ? "CHỈNH SỬA SẢN PHẨM" : "THÊM SẢN PHẨM MỚI"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                width={700}
                okButtonProps={{ style: { background: '#0a1628' } }}
            >
                <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 20 }}>
                    <Row gutter={16}>
                        <Col span={16}><Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}><Input/></Form.Item></Col>
                        <Col span={8}><Form.Item name="sku" label="Mã SKU" rules={[{ required: true }]}><Input/></Form.Item></Col>
                    </Row>
                    
                    <Form.Item label="Hình ảnh sản phẩm">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', border: '1px dashed #e2e8f0', padding: '16px', borderRadius: '12px', background: '#f8fafc' }}>
                            <Upload 
                                customRequest={handleCloudinaryUpload} 
                                showUploadList={false} 
                                accept="image/*"
                            >
                                <Button 
                                    type="dashed" 
                                    icon={uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />} 
                                    disabled={uploading} 
                                    style={{ height: '40px', borderRadius: '8px', fontWeight: 600, color: '#475569' }}
                                >
                                    {uploading ? 'Đang tải lên...' : 'Chọn ảnh từ thiết bị'}
                                </Button>
                            </Upload>
                            
                            {imageUrl && (
                                <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0, background: '#fff' }}>
                                    <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>
                    </Form.Item>
                    
                    <Form.Item name="imageUrl" hidden><Input /></Form.Item>

                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="basePrice" label="Giá bán"><InputNumber style={{width:'100%'}}/></Form.Item></Col>
                        <Col span={8}>
                            <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
                                <Select>
                                    {categories.map(cat => <Option key={cat.id} value={cat.id}>{cat.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row> 
                </Form>
            </Modal>


        </div>
    );
};

export default ProductManagementPage;
