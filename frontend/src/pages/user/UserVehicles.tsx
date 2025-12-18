import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Plus, Trash2, Car } from 'lucide-react';

// Define proper TypeScript interface for Vehicle
interface Vehicle {
  vehicleId: number;
  licensePlate: string;
  vehicleType: string;
  brand: string;
  model: string;
  color?: string;
}

// Form data interface
interface VehicleFormData {
  licensePlate: string;
  vehicleType: string;
  brand: string;
  model: string;
  color: string;
}

export function UserVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    licensePlate: '',
    vehicleType: 'CAR',
    brand: '',
    model: '',
    color: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { token } = useAuth();

  const loadVehicles = () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch('http://localhost:8080/users/vehicles', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch vehicles');
        }
        return res.json();
      })
      .then((data: Vehicle[]) => {
        setVehicles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading vehicles:', err);
        setVehicles([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadVehicles();
  }, [token]);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) return;

    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:8080/users/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add vehicle');
      }

      // Reload vehicles and reset form
      loadVehicles();
      setShowAddForm(false);
      setFormData({
        licensePlate: '',
        vehicleType: 'CAR',
        brand: '',
        model: '',
        color: '',
      });
    } catch (err) {
      console.error('Add vehicle error:', err);
      alert('Failed to add vehicle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/users/vehicles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }

      loadVehicles();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete vehicle. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 font-medium">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
          <p className="text-gray-600 mt-1">Manage your registered vehicles</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : (
            <>
              <Plus className="mr-2" size={18} />
              Add Vehicle
            </>
          )}
        </Button>
      </div>

      {/* Add Vehicle Form */}
      {showAddForm && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Add New Vehicle
          </h2>
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <Input
              label="License Plate"
              type="text"
              value={formData.licensePlate}
              onChange={(e) =>
                setFormData({ ...formData, licensePlate: e.target.value })
              }
              placeholder="e.g., ABC-123"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleType: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="CAR">Car</option>
                <option value="MOTORCYCLE">Motorcycle</option>
                <option value="TRUCK">Truck</option>
                <option value="SUV">SUV</option>
                <option value="VAN">Van</option>
              </select>
            </div>

            <Input
              label="Brand"
              type="text"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              placeholder="e.g., Toyota"
              required
            />

            <Input
              label="Model"
              type="text"
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              placeholder="e.g., Corolla"
              required
            />

            <Input
              label="Color (Optional)"
              type="text"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              placeholder="e.g., Silver"
            />

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Adding Vehicle...' : 'Add Vehicle'}
            </Button>
          </form>
        </Card>
      )}

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Car className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-lg font-medium text-gray-900 mb-2">
              No vehicles yet
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Add your first vehicle to get started
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2" size={18} />
              Add Vehicle
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.vehicleId} className="relative">
              <div className="space-y-4">
                {/* Vehicle Icon */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Car className="text-indigo-600" size={24} />
                  </div>
                  <button
                    onClick={() => handleDelete(vehicle.vehicleId)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete vehicle"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Vehicle Details */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {vehicle.licensePlate}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {vehicle.vehicleType}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Brand:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {vehicle.brand}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Model:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {vehicle.model}
                    </span>
                  </div>
                  {vehicle.color && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Color:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.color}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}