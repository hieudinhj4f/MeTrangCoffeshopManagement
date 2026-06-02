import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import IntroducePage from '../pages/IntroducePage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import DashboardPage from '../pages/Admin/DashboardPage';
import RoleGuard from '../guard/RoleGuard';
import HomePage from '../pages/Client/HomePage';

// ── 1. IMPORT CHÍNH XÁC ĐƯỜNG DẪN ĐẾN CÁC THƯ MỤC CON MỚI CỦA HIẾU ──
import ProfilePage from '../pages/Client/profile/ProfilePage';
import RankDisplay from '../pages/Client/rank/RankDisplay';

const AppRoute = () => {
    return (
        <Routes>
            {/* --- 1. Public Routes (Ai cũng vào được) --- */}
            <Route path="/" element={<IntroducePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* --- 2. Customer Routes (Chỉ Khách hàng và Admin) --- */}
            <Route element={<RoleGuard allowedRoles={['CUSTOMER', 'ADMIN']} />}>
                <Route path="/shop" element={<HomePage />} />
                
                {/* ── 2. KHAI BÁO CÁC TUYẾN ĐƯỜNG MỚI NẰM TRONG GUARD TẠI ĐÂY ── */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/rank-details" element={<RankDisplay />} />
            </Route>

            {/* --- 3. Admin & Staff Routes (Trang quản trị Mê Trang) --- */}
            <Route element={<RoleGuard allowedRoles={['ADMIN', 'WAREHOUSE_KEEPER', 'DISPATCHER', 'STAFF']} />}>
                <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* --- 4. Error Routes --- */}
            <Route path="/403" element={
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h1>403 - Không có quyền truy cập</h1>
                    <p>Tài khoản của Hiếu không có quyền xem trang này!</p>
                </div>
            } />
            
            {/* Nếu gõ bậy bạ thì về trang chủ */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoute;