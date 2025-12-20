import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Heart, Calendar, Filter } from 'lucide-react';
import { Card } from '../../components/ui/Card';

interface SpotData {
  spotId?: number;
  id?: number;
  spotNumber: string;
  spotType: string;
  status: string;
  hourlyRate: number;
  locationDetails?: string;
}

interface Vehicle {
  vehicleId: number;
  licensePlate: string;
}

interface ParkedVehicle {
  reservationId: number;
  parkingSpot: { spotNumber: string; hourlyRate: number };
  vehicle: { licensePlate: string };
  startTime: string;
  totalAmount: number;
}

export function UserSpots() {
  const [spots, setSpots] = useState<SpotData[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parkedVehicles, setParkedVehicles] = useState<ParkedVehicle[]>([]);
  const [currentCosts, setCurrentCosts] = useState<Record<number, number>>({});
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  const loadFavorites = async () => {
    try {
      const response = await fetch('http://localhost:8080/users/spots/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.map((spot: SpotData) => spot.spotId || spot.id));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadSpots = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'ALL' 
        ? `http://localhost:8080/users/spots/available`
        : `http://localhost:8080/users/spots/available`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        let data = await response.json();
        if (Array.isArray(data)) {
          if (statusFilter !== 'ALL') {
            data = data.filter((spot: SpotData) => spot.status === statusFilter);
          }
          setSpots(data);
          setTotalPages(1);
        } else if (data.content) {
          setSpots(data.content);
          setTotalPages(data.totalPages || 1);
        } else {
          setSpots([]);
        }
      }
    } catch (error) {
      console.error('Error loading spots:', error);
      setSpots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      loadFavorites();
      loadSpots();
      fetch('http://localhost:8080/users/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error('Error loading vehicles:', err));
      
      fetch(`http://localhost:8080/reservations/user/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setParkedVehicles(data.filter((r: any) => r.status === 'ACTIVE')))
      .catch(err => console.error('Error loading parked vehicles:', err));
    }
  }, [token, user, page, statusFilter]);

  // Update costs for parked vehicles every minute
  useEffect(() => {
    if (!token || parkedVehicles.length === 0) return;

    const updateCosts = async () => {
      const costs: Record<number, number> = {};
      for (const pv of parkedVehicles) {
        try {
          const response = await fetch(
            `http://localhost:8080/reservations/${pv.reservationId}/current-cost`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await response.json();
          costs[pv.reservationId] = data.currentCost;
        } catch (err) {
          console.error('Error fetching cost:', err);
        }
      }
      setCurrentCosts(costs);
    };

    updateCosts();
    const interval = setInterval(updateCosts, 3600000);
    return () => clearInterval(interval);
  }, [token, parkedVehicles]);

  const calculateDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const toggleFavorite = async (spot: SpotData) => {
    const spotId = spot.spotId || spot.id;
    if (!spotId) return;
    const isFavorite = favorites.includes(spotId);
    const url = `http://localhost:8080/users/spots/${spotId}/favorite`;
    const method = isFavorite ? 'DELETE' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        if (isFavorite) {
          setFavorites(favorites.filter((id) => id !== spotId));
        } else {
          setFavorites([...favorites, spotId]);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleReserve = (spot: SpotData) => {
    const spotId = spot.spotId || spot.id;
    window.location.href = `/user/reservations?spotId=${spotId}`;
  };

  const handleParkNow = async (spot: SpotData) => {
    const spotId = spot.spotId || spot.id;
    if (!spotId) {
      alert('Invalid spot');
      return;
    }
    if (!vehicles || vehicles.length === 0) {
      alert('Please add a vehicle first');
      window.location.href = '/user/vehicles';
      return;
    }

    const vehicleId = vehicles[0].vehicleId;
    
    try {
      const response = await fetch(`http://localhost:8080/users/park?vehicleId=${vehicleId}&spotId=${spotId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Vehicle parked successfully!');
        loadSpots();
      } else {
        alert('Failed to park vehicle');
      }
    } catch (error) {
      console.error('Park error:', error);
      alert('Error parking vehicle');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'OCCUPIED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Parking Spots</h1>
        <p className="text-gray-600 mt-1">Browse and reserve available parking spots</p>
      </div>

      {/* Currently Parked Vehicles */}
      {parkedVehicles.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🚗 Currently Parked Vehicles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parkedVehicles.map(pv => (
              <div key={pv.reservationId} className="bg-white p-4 rounded-lg shadow-md border border-green-300">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-lg text-gray-900">Spot {pv.parkingSpot.spotNumber}</p>
                    <p className="text-sm text-gray-600">{pv.vehicle.licensePlate}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    OCCUPIED
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-gray-600">Parked: {new Date(pv.startTime).toLocaleString()}</p>
                  <p className="text-gray-600">Duration: {calculateDuration(pv.startTime)}</p>
                  <p className="text-gray-600">Rate: RWF {pv.parkingSpot.hourlyRate}/hr</p>
                  <p className="font-semibold text-indigo-600">
                    Current: RWF {(currentCosts[pv.reservationId] || pv.totalAmount || pv.parkingSpot.hourlyRate).toLocaleString()}
                  </p>
                  <p className="text-xs text-yellow-600">⏱ Updates every hour</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <Filter size={20} className="text-gray-600" />
            <div className="flex flex-wrap gap-2">
              {['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(0);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setStatusFilter('ALL');
              loadFavorites();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
          >
            <Heart size={18} />
            <span className="text-sm font-medium">
              My Favorites ({favorites.length})
            </span>
          </button>
        </div>
      </div>

      {/* Spots Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : spots.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <p>No parking spots found</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {spots.map((spot) => {
            const spotId = spot.spotId || spot.id;
            const isFavorite = favorites.includes(spotId);
            const isAvailable = spot.status === 'AVAILABLE';

            return (
              <Card key={spotId} className="relative hover:shadow-lg transition-shadow">
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(spot)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all z-10"
                >
                  <Heart
                    size={20}
                    className={isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}
                  />
                </button>

                <div className="space-y-4">
                  {/* Spot Number */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {spot.spotNumber}
                    </h3>
                    <p className="text-sm text-gray-600">{spot.spotType}</p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        spot.status
                      )}`}
                    >
                      {spot.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rate:</span>
                      <span className="font-semibold text-gray-900">
                        RWF {spot.hourlyRate.toLocaleString()}/hr
                      </span>
                    </div>
                    {spot.locationDetails && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="text-sm text-gray-900">
                          {spot.locationDetails}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleParkNow(spot)}
                      disabled={!isAvailable}
                      className="w-full"
                      variant={isAvailable ? 'primary' : 'secondary'}
                    >
                      {isAvailable ? 'Park Now' : 'Not Available'}
                    </Button>
                    {isAvailable && (
                      <Button
                        onClick={() => handleReserve(spot)}
                        className="w-full"
                        variant="secondary"
                      >
                        <Calendar className="mr-2" size={18} />
                        Reserve for Later
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
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