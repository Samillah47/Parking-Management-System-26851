import React, { useEffect, useState } from 'react';
import { ParkingSquare, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface StaffStats {
  availableSpots: number;
  occupiedSpots: number;
  reservedSpots: number;
  pendingPayments: number;
}

export function StaffDashboard() {
  const [stats, setStats] = useState<StaffStats | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:8080/staff/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats({
          availableSpots: data.availableSpots || 0,
          occupiedSpots: data.occupiedSpots || 0,
          reservedSpots: data.reservedSpots || 0,
          pendingPayments: data.pendingPayments || 0,
        });
      })
      .catch(console.error);
  }, [token]);

  if (!stats) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600 mt-1">Parking operations management</p>
        </div>
        <Button onClick={() => navigate('/staff/profile')}>My Profile</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Available Spots"
          value={stats.availableSpots}
          icon={<ParkingSquare size={24} />}
          color="green"
        />
        <StatsCard
          title="Occupied Spots"
          value={stats.occupiedSpots}
          icon={<ParkingSquare size={24} />}
          color="red"
        />
        <StatsCard
          title="Reserved Spots"
          value={stats.reservedSpots}
          icon={<Clock size={24} />}
          color="yellow"
        />
        <StatsCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={<DollarSign size={24} />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              className="w-full justify-start"
              onClick={() => navigate('/staff/assign')}
            >
              <ParkingSquare className="mr-2" size={20} />
              Assign Parking Spot
            </Button>
            <Button
              className="w-full justify-start"
              variant="secondary"
              onClick={() => navigate('/staff/exit')}
            >
              <CheckCircle className="mr-2" size={20} />
              Process Exit
            </Button>
            <Button
              className="w-full justify-start"
              variant="secondary"
              onClick={() => navigate('/staff/payments')}
            >
              <DollarSign className="mr-2" size={20} />
              View Pending Payments
            </Button>
            <Button
              className="w-full justify-start"
              variant="secondary"
              onClick={() => navigate('/staff/spots')}
            >
              <ParkingSquare className="mr-2" size={20} />
              View All Spots
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Spot Status Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Available</span>
              <span className="text-lg font-bold text-green-600">
                {stats.availableSpots}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium">Occupied</span>
              <span className="text-lg font-bold text-red-600">
                {stats.occupiedSpots}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium">Reserved</span>
              <span className="text-lg font-bold text-yellow-600">
                {stats.reservedSpots}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}