import React from "react";

// 💡 Đoạn này dán vào file Modal sửa sản phẩm (Ảnh Modal bạn vừa chụp)
const [uploading, setUploading] = useState(false);
const [imageUrl, setImageUrl] = useState(''); 

const handleCloudinaryUpload = async ({ file, onSuccess, onError }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'TEN_PRESET_UNSIGNED_CUA_HIEU'); 

  setUploading(true);
  try {
    const response = await axios.post(
      'https://api.cloudinary.com/v1_1/TEN_CLOUD_NAME_CUA_HIEU/image/upload',
      formData
    );
    const secureUrl = response.data.secure_url;
    setImageUrl(secureUrl);
    
    // Gán giá trị link online này vào trường dữ liệu của Form để lúc ấn OK nó gửi về Backend
    // form.setFieldsValue({ imageUrl: secureUrl }); 

    onSuccess(response.data);
    message.success('Tải ảnh từ thiết bị lên Cloudinary thành công!');
  } catch (error) {
    onError(error);
    message.error('Tải ảnh thất bại!');
  } finally {
    setUploading(false);
  }
};

export default ProductModel;