import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export function StaffAssignSpot() {
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8080/staff/park', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ licensePlate, vehicleType })
      });

      if (response.ok) {
        setSuccess('Spot assigned successfully!');
      } else {
        setError('Failed to assign spot. Please try again.');
      }
    } catch  {
      setError('Network error. Please check your connection.');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Assign Parking Spot</h1>
      <form onSubmit={handleAssign} className="max-w-md space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <Input
          label="License Plate"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          placeholder="Enter license plate"
          required
        />
        <Input
          label="Vehicle Type"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          placeholder="e.g., CAR"
          required
        />
        <Button type="submit" className="w-full">Assign Spot</Button>
      </form>
    </div>
  );
}