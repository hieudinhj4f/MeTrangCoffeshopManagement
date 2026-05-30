import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();

    // 1. Nếu chưa đăng nhập -> Về trang Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Nếu đã đăng nhập nhưng không đúng quyền -> Về trang 403 (Forbidden)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/403" replace />;
    }

    // 3. Nếu thỏa mãn hết -> Cho phép vào trang
    return <Outlet />;
};

export default ProtectedRoute;