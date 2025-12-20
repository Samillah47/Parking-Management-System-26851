import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ReservationData {
  reservationId: number;
  parkingSpot: { spotNumber: string };
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
}

interface Vehicle {
  vehicleId: number;
  licensePlate: string;
}

interface Spot {
  spotId: number;
  spotNumber: string;
  hourlyRate: number;
}

export function UserReservations() {
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedSpot, setSelectedSpot] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentCosts, setCurrentCosts] = useState<Record<number, number>>({});
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token || !user?.userId) return;

    Promise.all([
      fetch(`http://localhost:8080/reservations/user/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`http://localhost:8080/users/vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`http://localhost:8080/users/spots/available`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json())
    ])
    .then(([resData, vehData, spotData]) => {
      setReservations(resData.filter((r: ReservationData) => r.status === 'RESERVED'));
      setVehicles(vehData);
      setSpots(spotData);
    })
    .catch(err => console.error('Fetch error:', err));
  }, [token, user]);

  // Update costs for reservations
  useEffect(() => {
    if (!token || reservations.length === 0) return;

    const updateCosts = async () => {
      const costs: Record<number, number> = {};
      for (const res of reservations) {
        try {
          const response = await fetch(
            `http://localhost:8080/reservations/${res.reservationId}/current-cost`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await response.json();
          costs[res.reservationId] = data.currentCost;
        } catch (err) {
          console.error('Error fetching cost:', err);
        }
      }
      setCurrentCosts(costs);
    };

    updateCosts();
    const interval = setInterval(updateCosts, 3600000);
    return () => clearInterval(interval);
  }, [token, reservations]);

  const handleCreateReservation = async () => {
    if (!selectedVehicle || !selectedSpot) return;
    
    try {
      const response = await fetch('http://localhost:8080/reservations/users/reservations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vehicleId: parseInt(selectedVehicle),
          spotId: parseInt(selectedSpot)
        })
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Create reservation error:', err);
    }
  };

  

  return (
    <div className="p-8 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">My Reservations</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'New Reservation'}
        </button>
      </div>
      
      
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Reservation</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Vehicle</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="">Choose your vehicle</option>
                {vehicles.map(v => (
                  <option key={v.vehicleId} value={v.vehicleId}>
                    🚗 {v.licensePlate}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Parking Spot</label>
              <select
                value={selectedSpot}
                onChange={(e) => setSelectedSpot(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="">Choose a parking spot</option>
                {spots.map(s => (
                  <option key={s.spotId} value={s.spotId}>
                    🅿️ {s.spotNumber} - RWF {s.hourlyRate}/hr
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={handleCreateReservation}
            disabled={!selectedVehicle || !selectedSpot}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {!selectedVehicle || !selectedSpot ? 'Select Vehicle & Spot' : 'Confirm Reservation'}
          </button>
        </div>
      )}
      
      {reservations.length === 0 ? (
        <p className="text-gray-500">You have no reservations.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservations.map(r => (
            <div key={r.reservationId} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{r.parkingSpot.spotNumber}</h3>
                    <p className="text-sm text-gray-500">Parking Spot</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  r.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                  r.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-700' :
                  r.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {r.status === 'ACTIVE' ? '🚗 PARKED' : r.status === 'RESERVED' ? '📅 RESERVED' : r.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start:</span>
                  <span className="font-medium text-gray-900">{new Date(r.startTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End:</span>
                  <span className="font-medium text-gray-900">{r.endTime ? new Date(r.endTime).toLocaleString() : 'Active'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600 font-semibold">Amount:</span>
                  <span className="font-bold text-indigo-600 text-lg">
                    RWF {(currentCosts[r.reservationId] || r.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <button
                onClick={async () => {
                  if (confirm('Start parking now in this reserved spot?')) {
                    try {
                      const response = await fetch(
                        `http://localhost:8080/reservations/${r.reservationId}/activate`,
                        {
                          method: 'PUT',
                          headers: { Authorization: `Bearer ${token}` }
                        }
                      );
                      if (response.ok) {
                        alert('Parking started!');
                        window.location.reload();
                      }
                    } catch (err) {
                      alert('Failed to start parking');
                    }
                  }
                }}
                className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                🚗 Park Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}