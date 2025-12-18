import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Filter, Edit, Trash2, Plus } from 'lucide-react';

interface ParkingSpot {
  spotId: number;
  spotNumber: string;
  spotType: string;
  status: string;
  locationDetails: string;
}

interface PageResponse {
  content: ParkingSpot[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export function AdminSpots() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const { token } = useAuth();

  // Column filters
  const [filters, setFilters] = useState({
    spotNumber: '',
    spotType: '',
    status: '',
    locationDetails: '',
  });

  // Load spots
  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const loadSpots = async () => {
      if (isMounted) setLoading(true);

      try {
        const response = await fetch(
          `http://localhost:8080/admin/spots/pageable?page=${page}&size=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data: PageResponse = await response.json();

        if (isMounted) {
          setSpots(data.content);
          setTotalPages(data.totalPages);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error:', err);
        if (isMounted) setLoading(false);
      }
    };

    loadSpots();

    return () => {
      isMounted = false;
    };
  }, [token, page]);

  // Filter spots
  const filteredSpots = spots.filter((spot) => {
    return (
      spot.spotNumber.toLowerCase().includes(filters.spotNumber.toLowerCase()) &&
      (filters.spotType === '' || spot.spotType === filters.spotType) &&
      (filters.status === '' || spot.status === filters.status) &&
      (spot.locationDetails || '')
        .toLowerCase()
        .includes(filters.locationDetails.toLowerCase())
    );
  });

  // Clear filters
  const clearFilters = () => {
    setFilters({ spotNumber: '', spotType: '', status: '', locationDetails: '' });
  };

  const hasActiveFilters =
    filters.spotNumber || filters.spotType || filters.status || filters.locationDetails;

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

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parking Spots</h1>
          <p className="text-gray-600 mt-1">
            {filteredSpots.length} of {spots.length} spots
          </p>
        </div>

        <div className="flex space-x-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <X size={16} className="mr-2" />
              Clear Filters
            </button>
          )}
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Plus size={16} className="mr-2" />
            Add Spot
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center flex-wrap gap-2 text-sm text-blue-700">
            <Filter size={16} />
            <span className="font-medium">Filters:</span>
            {filters.spotNumber && (
              <span className="px-2 py-1 bg-blue-100 rounded text-xs">
                Spot: "{filters.spotNumber}"
              </span>
            )}
            {filters.spotType && (
              <span className="px-2 py-1 bg-blue-100 rounded text-xs">
                Type: {filters.spotType}
              </span>
            )}
            {filters.status && (
              <span className="px-2 py-1 bg-blue-100 rounded text-xs">
                Status: {filters.status}
              </span>
            )}
            {filters.locationDetails && (
              <span className="px-2 py-1 bg-blue-100 rounded text-xs">
                Location: "{filters.locationDetails}"
              </span>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              {/* Headers */}
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Spot Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>

              {/* FILTER ROW */}
              <tr className="bg-white border-b-2 border-gray-300">
                <th className="px-6 py-2">
                  <input
                    type="text"
                    placeholder="Filter spot..."
                    value={filters.spotNumber}
                    onChange={(e) =>
                      setFilters({ ...filters, spotNumber: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-normal"
                  />
                </th>
                <th className="px-6 py-2">
                  <select
                    value={filters.spotType}
                    onChange={(e) =>
                      setFilters({ ...filters, spotType: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-normal"
                  >
                    <option value="">All Types</option>
                    <option value="REGULAR">REGULAR</option>
                    <option value="HANDICAP">HANDICAP</option>
                    <option value="EV">EV CHARGING</option>
                  </select>
                </th>
                <th className="px-6 py-2">
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-normal"
                  >
                    <option value="">All Status</option>
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="RESERVED">RESERVED</option>
                  </select>
                </th>
                <th className="px-6 py-2">
                  <input
                    type="text"
                    placeholder="Filter location..."
                    value={filters.locationDetails}
                    onChange={(e) =>
                      setFilters({ ...filters, locationDetails: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-normal"
                  />
                </th>
                <th className="px-6 py-2"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredSpots.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {hasActiveFilters ? 'No spots match your filters' : 'No spots found'}
                  </td>
                </tr>
              ) : (
                filteredSpots.map((spot) => (
                  <tr key={spot.spotId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{spot.spotNumber}</span>
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
                      <span className="text-sm text-gray-600">{spot.locationDetails}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredSpots.length} of {spots.length} spots
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}