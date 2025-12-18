import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export function StaffProcessExit() {
  const [spotId, setSpotId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();

  const handleExit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:8080/staff/exit/${spotId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Exit processed. Total charge: RWF ${data.totalCharge}`);
      } else {
        setError('Failed to process exit. Please try again.');
      }
    } catch  {
      setError('Network error. Please check your connection.');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Process Vehicle Exit</h1>
      <form onSubmit={handleExit} className="max-w-md space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <Input
          label="Spot ID"
          value={spotId}
          onChange={(e) => setSpotId(e.target.value)}
          placeholder="Enter spot ID"
          required
        />
        <Button type="submit" className="w-full">Process Exit</Button>
      </form>
    </div>
  );
}