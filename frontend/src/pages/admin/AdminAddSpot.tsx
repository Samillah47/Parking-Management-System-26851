import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft } from 'lucide-react';

export function AdminAddSpot() {
  const [formData, setFormData] = useState({
    spotNumber: '',
    spotType: 'REGULAR',
    hourlyRate: '',
    locationDetails: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/admin/spots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          spotNumber: formData.spotNumber,
          spotType: formData.spotType,
          status: 'AVAILABLE',
          hourlyRate: parseFloat(formData.hourlyRate),
          locationDetails: formData.locationDetails,
        }),
      });

      if (response.ok) {
        alert('Parking spot created successfully!');
        navigate('/admin/spots');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create spot');
      }
    } catch  {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/admin/spots')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back to Spots
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Add New Parking Spot
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="Spot Number"
            type="text"
            value={formData.spotNumber}
            onChange={(e) =>
              setFormData({ ...formData, spotNumber: e.target.value })
            }
            placeholder="e.g., A01"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spot Type
            </label>
            <select
              value={formData.spotType}
              onChange={(e) =>
                setFormData({ ...formData, spotType: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="REGULAR">Regular</option>
              <option value="HANDICAPPED">Handicapped</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          <Input
            label="Hourly Rate (RWF)"
            type="number"
            value={formData.hourlyRate}
            onChange={(e) =>
              setFormData({ ...formData, hourlyRate: e.target.value })
            }
            placeholder="e.g., 500"
            required
            min="0"
            step="50"
          />

          <Input
            label="Location Details"
            type="text"
            value={formData.locationDetails}
            onChange={(e) =>
              setFormData({ ...formData, locationDetails: e.target.value })
            }
            placeholder="e.g., Ground Floor, Section A"
          />

          <div className="flex space-x-4 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Create Spot'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => navigate('/admin/spots')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}