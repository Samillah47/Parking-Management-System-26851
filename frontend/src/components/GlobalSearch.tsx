/* eslint-disable react-refresh/only-export-components */
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Search, Users, ParkingSquare, Calendar, ArrowRight, Command, Car } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'users' | 'spots' | 'reservations' | 'vehicles' | 'actions';
  action: () => void;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper types
interface UserItem {
  userId: number;
  username: string;
  email: string;
  role: string;
}

interface SpotItem {
  spotId: number;
  spotNumber: string;
  spotType: string;
  status: string;
}

interface ReservationItem {
  reservationId: number;
  parkingSpot: { spotNumber: string };
  vehicle?: { licensePlate: string };
  startTime: string;
  status: string;
}

interface VehicleItem {
  vehicleId: number;
  licensePlate: string;
  vehicleType: string;
  brand: string;
  model: string;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick Actions - memoized
  const quickActions = useCallback((): SearchResult[] => {
    const actions: SearchResult[] = [];

    if (user?.role === 'ADMIN') {
      actions.push(
        {
          id: 'admin-dashboard',
          title: 'Admin Dashboard',
          subtitle: 'System overview',
          category: 'actions',
          action: () => navigate('/admin/dashboard'),
        },
        {
          id: 'admin-users',
          title: 'Manage Users',
          subtitle: 'View and manage all users',
          category: 'actions',
          action: () => navigate('/admin/users'),
        },
        {
          id: 'admin-spots',
          title: 'Manage Parking Spots',
          subtitle: 'Configure parking spots',
          category: 'actions',
          action: () => navigate('/admin/spots'),
        },
        {
          id: 'admin-reports',
          title: 'View Reports',
          subtitle: 'Revenue and analytics',
          category: 'actions',
          action: () => navigate('/admin/reports'),
        }
      );
    }

    if (user?.role === 'STAFF') {
      actions.push(
        {
          id: 'staff-dashboard',
          title: 'Staff Dashboard',
          subtitle: 'Parking operations overview',
          category: 'actions',
          action: () => navigate('/staff/dashboard'),
        },
        {
          id: 'staff-spots',
          title: 'View Spots',
          subtitle: 'Check parking availability',
          category: 'actions',
          action: () => navigate('/staff/spots'),
        }
      );
    }

    if (user?.role === 'USER') {
      actions.push(
        {
          id: 'user-dashboard',
          title: 'My Dashboard',
          subtitle: 'Your parking activity',
          category: 'actions',
          action: () => navigate('/user/dashboard'),
        },
        {
          id: 'user-spots',
          title: 'Available Spots',
          subtitle: 'Find parking',
          category: 'actions',
          action: () => navigate('/user/spots'),
        },
        {
          id: 'user-vehicles',
          title: 'My Vehicles',
          subtitle: 'Manage your vehicles',
          category: 'actions',
          action: () => navigate('/user/vehicles'),
        },
        {
          id: 'user-reservations',
          title: 'My Reservations',
          subtitle: 'View your bookings',
          category: 'actions',
          action: () => navigate('/user/reservations'),
        }
      );
    }

    return actions;
  }, [user, navigate]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus when opened and set initial results
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // Don't call setResults here - it will be set by performSearch
    }
  }, [isOpen]);

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!token || !user) return;

      // If empty query, show quick actions
      if (!searchQuery.trim()) {
        setResults(quickActions());
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const searchResults: SearchResult[] = [];

      try {
        // ========== ADMIN SEARCH ==========
        if (user.role === 'ADMIN') {
          const response = await fetch(
            `http://localhost:8080/admin/search/global?q=${encodeURIComponent(searchQuery)}`,
            { headers }
          );

          if (response.ok) {
            const data = await response.json();

            // Process users
            if (data.users && Array.isArray(data.users)) {
              data.users.forEach((u: UserItem) => {
                searchResults.push({
                  id: `user-${u.userId}`,
                  title: u.username,
                  subtitle: `${u.email} • ${u.role}`,
                  category: 'users',
                  action: () => {
                    navigate('/admin/users');
                    onClose();
                  },
                });
              });
            }

            // Process spots
            if (data.spots && Array.isArray(data.spots)) {
              data.spots.forEach((s: SpotItem) => {
                searchResults.push({
                  id: `spot-${s.spotId}`,
                  title: `Spot ${s.spotNumber}`,
                  subtitle: `${s.spotType} • ${s.status}`,
                  category: 'spots',
                  action: () => {
                    navigate('/admin/spots');
                    onClose();
                  },
                });
              });
            }

            // Process reservations
            if (data.reservations && Array.isArray(data.reservations)) {
              data.reservations.forEach((r: ReservationItem) => {
                searchResults.push({
                  id: `reservation-${r.reservationId}`,
                  title: `Reservation #${r.reservationId}`,
                  subtitle: `Spot ${r.parkingSpot.spotNumber} • ${r.status}`,
                  category: 'reservations',
                  action: () => {
                    navigate('/admin/dashboard');
                    onClose();
                  },
                });
              });
            }
          }
        }

        // ========== STAFF SEARCH ==========
        if (user.role === 'STAFF') {
          const response = await fetch(
            `http://localhost:8080/staff/spots/search?q=${encodeURIComponent(searchQuery)}`,
            { headers }
          );

          if (response.ok) {
            const spots: SpotItem[] = await response.json();
            spots.slice(0, 8).forEach((s) => {
              searchResults.push({
                id: `spot-${s.spotId}`,
                title: `Spot ${s.spotNumber}`,
                subtitle: `${s.status} • ${s.spotType}`,
                category: 'spots',
                action: () => {
                  navigate('/staff/spots');
                  onClose();
                },
              });
            });
          }
        }

        // ========== USER SEARCH ==========
        if (user.role === 'USER') {
          const response = await fetch(
            `http://localhost:8080/users/search?q=${encodeURIComponent(searchQuery)}`,
            { headers }
          );

          if (response.ok) {
            const data = await response.json();

            // Process vehicles
            if (data.vehicles && Array.isArray(data.vehicles)) {
              data.vehicles.forEach((v: VehicleItem) => {
                searchResults.push({
                  id: `vehicle-${v.vehicleId}`,
                  title: v.licensePlate,
                  subtitle: `${v.brand} ${v.model} • ${v.vehicleType}`,
                  category: 'vehicles',
                  action: () => {
                    navigate('/user/vehicles');
                    onClose();
                  },
                });
              });
            }

            // Process reservations
            if (data.reservations && Array.isArray(data.reservations)) {
              data.reservations.forEach((r: ReservationItem) => {
                searchResults.push({
                  id: `reservation-${r.reservationId}`,
                  title: `Spot ${r.parkingSpot.spotNumber}`,
                  subtitle: `${new Date(r.startTime).toLocaleDateString()} • ${r.status}`,
                  category: 'reservations',
                  action: () => {
                    navigate('/user/reservations');
                    onClose();
                  },
                });
              });
            }

            // Process favorite spots
            if (data.favoriteSpots && Array.isArray(data.favoriteSpots)) {
              data.favoriteSpots.forEach((s: SpotItem) => {
                searchResults.push({
                  id: `fav-spot-${s.spotId}`,
                  title: `⭐ Spot ${s.spotNumber}`,
                  subtitle: `Favorite • ${s.status}`,
                  category: 'spots',
                  action: () => {
                    navigate('/user/spots');
                    onClose();
                  },
                });
              });
            }
          }
        }
      } catch (err) {
        console.error('Global search error:', err);
      }

      // Set results - either search results or quick actions
      setResults(searchResults.length > 0 ? searchResults : quickActions());
      setSelectedIndex(0);
    },
    [user, token, navigate, onClose, quickActions]
  );

  // Debounce search
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen, performSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      results[selectedIndex].action();
      setQuery('');
    }
  };

  const getCategoryIcon = (category: SearchResult['category']) => {
    switch (category) {
      case 'users':
        return <Users size={16} className="text-indigo-600" />;
      case 'spots':
        return <ParkingSquare size={16} className="text-green-600" />;
      case 'reservations':
        return <Calendar size={16} className="text-blue-600" />;
      case 'vehicles':
        return <Car size={16} className="text-yellow-600" />;
      case 'actions':
        return <ArrowRight size={16} className="text-gray-600" />;
      default:
        return <Search size={16} className="text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          onClose();
          setQuery('');
        }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-gray-200">
          <Search size={20} className="text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search users, spots, reservations, vehicles..."
            className="flex-1 text-lg outline-none placeholder-gray-400"
          />
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">
              <Command size={12} />
            </kbd>
            <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">
              K
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {!results.length ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <Search size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No results found</p>
              <p className="text-sm mt-1">Try searching for something else</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => {
                    result.action();
                    setQuery('');
                  }}
                  className={`w-full flex items-center px-4 py-3 transition-colors ${
                    index === selectedIndex ? 'bg-indigo-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="mr-3">{getCategoryIcon(result.category)}</div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{result.title}</p>
                    <p className="text-sm text-gray-500">{result.subtitle}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 mr-1">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 mr-1">
                ↵
              </kbd>
              Select
            </span>
            <span className="flex items-center">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 mr-1">
                esc
              </kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}