import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSpots } from './pages/admin/AdminSpots';
import { AdminAddSpot } from './pages/admin/AdminAddSpot';
import { AdminReports } from './pages/admin/AdminReports';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffAssignSpot } from './pages/staff/StaffAssignSpot';
import { StaffProcessExit } from './pages/staff/StaffProcessExit';
import { StaffSpots } from './pages/staff/StaffSpots';
import { StaffPayments } from './pages/staff/StaffPayments';

// User Pages
import { UserDashboard } from './pages/user/UserDashboard';
import { UserReservations } from './pages/user/UserReservations';
import { UserVehicles } from './pages/user/UserVehicles';
import { UserPayments } from './pages/user/UserPayments';
import { UserSpots } from './pages/user/UserSpots';
import { UserHistory } from './pages/user/UserHistory';

// Common Pages
import { ProfilePage } from './pages/Common/ProfilePage';
import { Verify2FA } from './pages/auth/Verify2fa';

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-2fa" element={<Verify2FA />} />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <div className="flex min-h-screen bg-gray-50">
                    <Sidebar />
                    <div className="flex-1">
                      <Navbar />
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="spots" element={<AdminSpots />} />
                        <Route path="spots/add" element={<AdminAddSpot />} />
                        <Route path="reports" element={<AdminReports />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route
                          path="*"
                          element={<Navigate to="/admin/dashboard" replace />}
                        />
                      </Routes>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff/*"
              element={
                <ProtectedRoute allowedRoles={['STAFF']}>
                  <div className="flex min-h-screen bg-gray-50">
                    <Sidebar />
                    <div className="flex-1">
                      <Navbar />
                      <Routes>
                        <Route path="dashboard" element={<StaffDashboard />} />
                        <Route path="assign" element={<StaffAssignSpot />} />
                        <Route path="exit" element={<StaffProcessExit />} />
                        <Route path="spots" element={<StaffSpots />} />
                        <Route path="payments" element={<StaffPayments />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route
                          path="*"
                          element={<Navigate to="/staff/dashboard" replace />}
                        />
                      </Routes>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/user/*"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <div className="flex min-h-screen bg-gray-50">
                    <Sidebar />
                    <div className="flex-1">
                      <Navbar />
                      <Routes>
                        <Route path="dashboard" element={<UserDashboard />} />
                        <Route path="reservations" element={<UserReservations />} />
                        <Route path="vehicles" element={<UserVehicles />} />
                        <Route path="payments" element={<UserPayments />} />
                        <Route path="spots" element={<UserSpots />} />
                        <Route path="history" element={<UserHistory />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route
                          path="*"
                          element={<Navigate to="/user/dashboard" replace />}
                        />
                      </Routes>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Root redirect based on role */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </AuthProvider>

    
  );
}

// Role-based redirect component
function RoleBasedRedirect() {
  const { user } = useAuth();

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === 'STAFF') {
    return <Navigate to="/staff/dashboard" replace />;
  } else {
    return <Navigate to="/user/dashboard" replace />;
  }
}

export default App;