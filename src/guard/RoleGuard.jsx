import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleGuard = ({ allowedRoles }) => {
    const { user } = useAuth();

    // 1. Nếu chưa đăng nhập (user null) -> Đá về trang login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Nếu đã đăng nhập nhưng Role không nằm trong danh sách cho phép
    // Ví dụ: CUSTOMER cố vào trang ADMIN
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/403" replace />;
    }

    // 3. Nếu thỏa mãn mọi điều kiện -> Cho phép render nội dung bên trong (Outlet)
    return <Outlet />;
};

export default RoleGuard;