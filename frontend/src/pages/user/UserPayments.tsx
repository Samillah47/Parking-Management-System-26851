import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

// Define proper TypeScript interfaces
interface Vehicle {
  vehicleId: number;
  licensePlate: string;
  vehicleType: string;
  brand: string;
  model: string;
}

interface ParkingSpot {
  spotId: number;
  spotNumber: string;
  spotType: string;
  status: string;
}

interface UnpaidReservation {
  reservationId: number;
  vehicle: Vehicle;
  parkingSpot: ParkingSpot;
  startTime: string;
  endTime?: string;
  status: string;
  totalAmount?: number;
}

export function UserPayments() {
  const [unpaid, setUnpaid] = useState<UnpaidReservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paying, setPaying] = useState<number | null>(null);
  const { token } = useAuth();

  const loadUnpaidReservations = () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch('http://localhost:8080/users/pending-payments', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch pending payments');
        }
        return res.json();
      })
      .then((data: UnpaidReservation[]) => {
        setUnpaid(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading unpaid reservations:', err);
        setUnpaid([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUnpaidReservations();
  }, [token]);

  const handlePayment = async (reservationId: number) => {
    if (!token) return;

    setPaying(reservationId);

    try {
      const response = await fetch(
        `http://localhost:8080/users/reservations/${reservationId}/pay`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      // Reload the list after successful payment
      loadUnpaidReservations();
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setPaying(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 font-medium">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Payments</h1>
        <p className="text-gray-600 mt-1">
          View and pay for your pending reservations
        </p>
      </div>

      {unpaid.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900">
              All caught up!
            </p>
            <p className="text-sm text-gray-600">
              You have no pending payments at this time.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reservation ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parking Spot
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {unpaid.map((reservation) => (
                <tr key={reservation.reservationId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      #{reservation.reservationId}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {reservation.vehicle.licensePlate}
                      </p>
                      <p className="text-xs text-gray-500">
                        {reservation.vehicle.brand} {reservation.vehicle.model}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {reservation.parkingSpot.spotNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {new Date(reservation.startTime).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {reservation.totalAmount
                        ? `RWF ${reservation.totalAmount.toLocaleString()}`
                        : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        reservation.status
                      )}`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      size="sm"
                      onClick={() => handlePayment(reservation.reservationId)}
                      disabled={paying === reservation.reservationId}
                    >
                      {paying === reservation.reservationId
                        ? 'Processing...'
                        : 'Pay Now'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {unpaid.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-indigo-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-indigo-900">
                Payment Information
              </p>
              <p className="text-sm text-indigo-700 mt-1">
                Please complete your pending payments to avoid late fees.
                Contact support if you have any payment issues.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}