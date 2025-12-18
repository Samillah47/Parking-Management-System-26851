import React, { useEffect, useState } from 'react';
import { Users, ParkingSquare, DollarSign, TrendingUp, Plus, FileText } from 'lucide-react';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AdminStats {
  totalUsers: number;
  totalStaff: number;
  totalSpots: number;
  availableSpots: number;
  occupiedSpots: number;
  reservedSpots: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    fetch(`http://localhost:8080/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats({
          totalUsers: data.totalUsers || 0,
          totalStaff: data.totalStaff || 0,
          totalSpots: data.totalSpots || 0,
          availableSpots: data.availableSpots || 0,
          occupiedSpots: data.occupiedSpots || 0,
          reservedSpots: data.reservedSpots || 0,
          revenueToday: data.todayRevenue || 0,
          revenueWeek: data.weeklyRevenue || 0,
          revenueMonth: data.monthlyRevenue || 0,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Admin dashboard error:', err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <p className="text-red-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  const occupancyRate =
    stats.totalSpots > 0
      ? ((stats.occupiedSpots / stats.totalSpots) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Complete system overview and management</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => navigate('/admin/profile')}>
            <Users className="mr-2" size={18} />
            My Profile
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users size={24} />}
          color="blue"
        />
        <StatsCard
          title="Total Spots"
          value={stats.totalSpots}
          icon={<ParkingSquare size={24} />}
          color="green"
        />
        <StatsCard
          title="Occupied Spots"
          value={stats.occupiedSpots}
          icon={<ParkingSquare size={24} />}
          color="yellow"
          trend={{
            value: `${occupancyRate}% occupancy`,
            isPositive: true,
          }}
        />
        <StatsCard
          title="Today's Revenue"
          value={`RWF ${stats.revenueToday.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="green"
        />
      </div>

      {/* Revenue & Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Summary
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  RWF {stats.revenueToday.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  RWF {stats.revenueWeek.toLocaleString()}
                </p>
              </div>
              <DollarSign className="text-indigo-600" size={32} />
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  RWF {stats.revenueMonth.toLocaleString()}
                </p>
              </div>
              <DollarSign className="text-blue-600" size={32} />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Parking Occupancy
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Occupied</span>
                <span className="font-medium">{stats.occupiedSpots} spots</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Available</span>
                <span className="font-medium">{stats.availableSpots} spots</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${100 - parseFloat(occupancyRate)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Reserved</span>
                <span className="font-medium">{stats.reservedSpots} spots</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.totalSpots > 0 ? (stats.reservedSpots / stats.totalSpots) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
          >
            <Users className="mx-auto mb-2 text-gray-600" size={24} />
            <p className="text-sm font-medium text-gray-900">Manage Users</p>
            <p className="text-xs text-gray-500 mt-1">
              View and manage all users
            </p>
          </button>

          <button
            onClick={() => navigate('/admin/spots')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
          >
            <ParkingSquare className="mx-auto mb-2 text-gray-600" size={24} />
            <p className="text-sm font-medium text-gray-900">Manage Spots</p>
            <p className="text-xs text-gray-500 mt-1">View and add parking spots</p>
          </button>

          <button
            onClick={() => navigate('/admin/spots/add')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <Plus className="mx-auto mb-2 text-gray-600" size={24} />
            <p className="text-sm font-medium text-gray-900">Add New Spot</p>
            <p className="text-xs text-gray-500 mt-1">Create parking spot</p>
          </button>

          <button
            onClick={() => navigate('/admin/reports')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
          >
            <FileText className="mx-auto mb-2 text-gray-600" size={24} />
            <p className="text-sm font-medium text-gray-900">View Reports</p>
            <p className="text-xs text-gray-500 mt-1">Generate and print reports</p>
          </button>
        </div>
      </Card>
    </div>
  );
}