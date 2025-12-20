import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LocationSelector } from '../../components/LocationSelector';

// Define proper TypeScript interface for Profile
interface Profile {
  profileId?: number;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  customLocation?: string;
}

interface Location {
  locationId: number;
  name: string;
  type: string;
}

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Profile>({
    fullName: '',
    gender: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>();
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token || !user) {
      setLoading(false);
      return;
    }

    const endpoint =
      user.role === 'USER'
        ? 'http://localhost:8080/users/profile'
        : user.role === 'STAFF'
        ? 'http://localhost:8080/staff/profile'
        : 'http://localhost:8080/admin/profile';

    fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setFormData({
          fullName: data.fullName || '',
          gender: data.gender || '',
          dateOfBirth: data.dateOfBirth || '',
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Profile fetch error:', err);
        setLoading(false);
      });
  }, [token, user]);



  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !user) return;

    const endpoint =
      user.role === 'USER'
        ? 'http://localhost:8080/users/profile'
        : user.role === 'STAFF'
        ? 'http://localhost:8080/staff/profile'
        : 'http://localhost:8080/admin/profile';

    setSaving(true);

    try {
      // Save profile
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data: Profile = await response.json();
      setProfile(data);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information</p>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Personal Information
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditing(!editing)}
              disabled={saving}
            >
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4 mt-6">
              <Input
                label="Full Name"
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Enter your full name"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Location</h3>
                <LocationSelector 
                  onLocationSelect={(locationId) => setSelectedLocationId(locationId)}
                  selectedLocationId={selectedLocationId}
                />
                <Button
                  type="button"
                  onClick={async () => {
                    if (!selectedLocationId) {
                      alert('Please select a location');
                      return;
                    }
                    
                    try {
                      const locationEndpoint = user.role === 'USER'
                        ? 'http://localhost:8080/users/location'
                        : user.role === 'STAFF'
                        ? 'http://localhost:8080/staff/location'
                        : 'http://localhost:8080/admin/location';
                      
                      const response = await fetch(locationEndpoint, {
                        method: 'PUT',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ locationId: selectedLocationId })
                      });
                      
                      if (response.ok) {
                        alert('Location saved successfully!');
                        window.location.reload();
                      } else {
                        alert('Failed to save location');
                      }
                    } catch (err) {
                      console.error('Error:', err);
                      alert('Error saving location');
                    }
                  }}
                  disabled={!selectedLocationId}
                  variant="secondary"
                  className="w-full"
                >
                  Save Location
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Username</p>
                  <p className="text-gray-900 mt-1">{user?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Email</p>
                  <p className="text-gray-900 mt-1">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Role</p>
                  <p className="text-gray-900 mt-1">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      {user?.role}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Full Name</p>
                  <p className="text-gray-900 mt-1">
                    {profile?.fullName || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Gender</p>
                  <p className="text-gray-900 mt-1">
                    {profile?.gender || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Date of Birth
                  </p>
                  <p className="text-gray-900 mt-1">
                    {profile?.dateOfBirth || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Location</p>
                  <p className="text-gray-900 mt-1">
                    {profile?.customLocation ? profile.customLocation.split(',')[0].trim() : 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Account Information Card */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">User ID</p>
              <p className="text-gray-900 mt-1">{user?.userId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Account Type</p>
              <p className="text-gray-900 mt-1">{user?.role} Account</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}