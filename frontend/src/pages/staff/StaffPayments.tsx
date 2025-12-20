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

interface User {
  userId: number;
  username: string;
  email: string;
}

interface PaymentData {
  reservationId: number;
  user: User;
  vehicle: Vehicle;
  parkingSpot: ParkingSpot;
  startTime: string;
  endTime?: string;
  status: string;
  totalAmount?: number;
  currentCost?: number;
}

interface PageResponse {
  content: PaymentData[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export function StaffPayments() {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentCosts, setCurrentCosts] = useState<Record<number, number>>({});
  const { token } = useAuth();

  useEffect(() => {
    // Early return if no token - prevents setState being called
    if (!token) {
      setLoading(false);
      return;
    }

    // Set loading INSIDE the effect with proper async handling
    let isMounted = true; // Prevent setState on unmounted component

    const fetchPayments = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(
          `http://localhost:8080/staff/pending-payments?page=${page}&size=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }

        const data: PageResponse = await response.json();

        // Only update state if component is still mounted
        if (isMounted) {
          setPayments(data.content || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error('Error fetching pending payments:', err);
        if (isMounted) {
          setPayments([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPayments();

    // Cleanup function to prevent setState on unmounted component
    return () => {
      isMounted = false;
    };
  }, [token, page]); // Dependencies: re-run when token or page changes

  // Calculate current costs for active reservations
  useEffect(() => {
    if (!token || payments.length === 0) return;

    const updateCosts = async () => {
      const costs: Record<number, number> = {};
      
      for (const payment of payments) {
        if (payment.status === 'ACTIVE') {
          try {
            const response = await fetch(
              `http://localhost:8080/reservations/${payment.reservationId}/current-cost`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await response.json();
            costs[payment.reservationId] = data.currentCost;
          } catch (err) {
            console.error('Error fetching cost:', err);
          }
        }
      }
      
      setCurrentCosts(costs);
    };

    updateCosts();
    const interval = setInterval(updateCosts, 3600000); // Update every hour

    return () => clearInterval(interval);
  }, [token, payments]);

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

  const calculateDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Payments</h1>
        <p className="text-gray-600 mt-1">
          View and manage pending payment reservations
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-medium">No pending payments</p>
              <p className="text-sm mt-1">All reservations are paid or inactive</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reservation ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spot
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.reservationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        #{payment.reservationId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payment.user.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {payment.parkingSpot.spotNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payment.vehicle.licensePlate}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.vehicle.brand} {payment.vehicle.model}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm text-gray-600">
                          {new Date(payment.startTime).toLocaleString()}
                        </span>
                        {payment.status === 'ACTIVE' && (
                          <p className="text-xs text-gray-500 mt-1">
                            Duration: {calculateDuration(payment.startTime)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {payment.status === 'ACTIVE' && currentCosts[payment.reservationId]
                            ? `RWF ${currentCosts[payment.reservationId].toLocaleString()}`
                            : payment.totalAmount
                            ? `RWF ${payment.totalAmount.toLocaleString()}`
                            : 'Pending'}
                        </span>
                        {payment.status === 'ACTIVE' && (
                          <p className="text-xs text-yellow-600 mt-1">
                            ⏱ Ongoing - Updates every hour
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}