import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Filter } from 'lucide-react';

interface Reservation {
  reservationId: number;
  parkingSpot: { spotNumber: string; hourlyRate: number };
  vehicle: { licensePlate: string };
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
}

export function UserHistory() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token || !user?.userId) return;

    setLoading(true);
    fetch(`http://localhost:8080/reservations/user/${user.userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setReservations(data.sort((a: Reservation, b: Reservation) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        ));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading history:', err);
        setLoading(false);
      });
  }, [token, user]);

  const filteredReservations = filter === 'ALL' 
    ? reservations 
    : reservations.filter(r => r.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
      case 'RESERVED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Parking History</h1>
        <p className="text-gray-600 mt-1">View all your parking activities</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-600" />
          <div className="flex flex-wrap gap-2">
            {['ALL', 'ACTIVE', 'RESERVED', 'COMPLETED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="mx-auto mb-4 text-gray-300" size={64} />
          <p className="text-gray-500">No activities found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Spot</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReservations.map((res) => (
                <tr key={res.reservationId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{res.parkingSpot.spotNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{res.vehicle.licensePlate}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {new Date(res.startTime).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {res.endTime ? new Date(res.endTime).toLocaleString() : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">
                      RWF {(res.totalAmount || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(res.status)}`}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <p className="text-sm text-indigo-900">
          <span className="font-semibold">Total Records:</span> {filteredReservations.length}
        </p>
      </div>
    </div>
  );
}
