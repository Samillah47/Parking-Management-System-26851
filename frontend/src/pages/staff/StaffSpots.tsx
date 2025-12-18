import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Define proper TypeScript interface for Spot
interface ParkingSpot {
  spotId: number;
  spotNumber: string;
  spotType: string;
  status: string;
  hourlyRate: number;
  locationDetails?: string;
}

// Page response interface
interface PageResponse {
  content: ParkingSpot[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export function StaffSpots() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchSpots = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(
          `http://localhost:8080/staff/spots?page=${page}&size=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch spots');
        }

        const data: PageResponse = await response.json();

        if (isMounted) {
          setSpots(data.content || []);
        }
      } catch (err) {
        console.error('Error fetching spots:', err);
        if (isMounted) {
          setSpots([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSpots();

    return () => {
      isMounted = false;
    };
  }, [token, page]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700';
      case 'OCCUPIED':
        return 'bg-red-100 text-red-700';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 font-medium">Loading spots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Parking Spots</h1>
        <p className="text-gray-600 mt-1">View all parking spots and their status</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {spots.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium">No parking spots found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spot Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hourly Rate
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {spots.map((spot) => (
                <tr key={spot.spotId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      {spot.spotNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{spot.spotType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        spot.status
                      )}`}
                    >
                      {spot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      RWF {spot.hourlyRate.toLocaleString()}/hr
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {spot.locationDetails || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">Page {page + 1}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={spots.length < 10}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}