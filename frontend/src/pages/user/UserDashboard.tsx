import React, { useEffect, useState } from 'react';
import { Calendar, Car, Clock, CheckCircle, ParkingSquare } from 'lucide-react';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// 1. Define Typed Interfaces for the Backend Responses
interface ReservationBackendResponse {
  reservationId: number;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  parkingSpot: {
    spotNumber: string;
  };
}

interface VehicleBackendResponse {
  vehicleId: number;
  licensePlate: string;
}

// 2. Define the UI Summary State
interface UserSummary {
  username: string;
  activeReservationsCount: number;
  totalVehicles: number;
  recentReservations: Array<{
    reservationId: number;
    spotNumber: string;
    startTime: string;
    endTime: string;
    status: string;
    totalAmount: number;
  }>;
}

export function UserDashboard() {
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.userId && token) {
      // 3. Fetch from REAL absolute URLs
      Promise.all([
        fetch(`http://localhost:8080/reservations/user/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json()),
        fetch(`http://localhost:8080/users/vehicles`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json())
      ])
      .then(([reservations, vehicles]: [ReservationBackendResponse[], VehicleBackendResponse[]]) => {
        // 4. Map data into the local UI state shape
        const activeReservations = reservations.filter((r) => r.status === 'ACTIVE');
        setSummary({
          username: user.username,
          activeReservationsCount: activeReservations.length,
          totalVehicles: vehicles.length,
          recentReservations: reservations
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .map((r) => ({
              reservationId: r.reservationId,
              spotNumber: r.parkingSpot.spotNumber,
              startTime: r.startTime,
              endTime: r.endTime,
              status: r.status,
              totalAmount: r.totalAmount || 0
            })).slice(0, 5) // Show top 5 recent activities
        });
      })
      .catch(err => {
        console.error("Dashboard fetch error:", err);
        // Set an empty state if server fails so it doesn't stay on "Loading..."
        setSummary({
          username: user.username,
          activeReservationsCount: 0,
          totalVehicles: 0,
          recentReservations: []
        });
      });
    }
  }, [token, user]);

  if (!summary) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {summary.username}!
        </h1>
        <p className="text-gray-600 mt-1">Manage your parking reservations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Active Reservations" 
          value={summary.activeReservationsCount} 
          icon={<Calendar size={24} />} 
          color="blue" 
        />
        <StatsCard 
          title="My Vehicles" 
          value={summary.totalVehicles} 
          icon={<Car size={24} />} 
          color="green" 
        />
        <StatsCard 
          title="Total Bookings" 
          value={summary.recentReservations.length} 
          icon={<CheckCircle size={24} />} 
          color="yellow" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activities
            </h3>
            <Button size="sm" onClick={() => navigate('/user/history')}>
              View All History
            </Button>
          </div>
          <div className="space-y-3">
            {summary.recentReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-100 rounded-lg">
                <Calendar className="mx-auto mb-2 text-gray-300" size={48} />
                <p>No activities yet</p>
              </div>
            ) : (
              summary.recentReservations.map(reservation => (
                <div key={reservation.reservationId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <ParkingSquare className="text-indigo-600" size={24} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Spot {reservation.spotNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(reservation.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      RWF {reservation.totalAmount.toLocaleString()}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      reservation.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                      reservation.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-700' :
                      reservation.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 
                      reservation.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" onClick={() => navigate('/user/reservations')}>
              <Calendar className="mr-2" size={20} />
              New Reservation
            </Button>
            <Button className="w-full justify-start" variant="secondary" onClick={() => navigate('/user/vehicles')}>
              <Car className="mr-2" size={20} />
              Manage Vehicles
            </Button>
          </div>

          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <Clock className="text-indigo-600 mb-2" size={24} />
            <p className="text-sm font-medium text-gray-900 mb-1">Need Help?</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Contact support for assistance with your parking needs or payment issues.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}