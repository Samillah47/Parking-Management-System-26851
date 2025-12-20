import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Location {
  locationId: number;
  name: string;
  type: string;
  parentId: number | null;
  children?: Location[];
}

interface LocationSelectorProps {
  onLocationSelect: (locationId: number) => void;
  selectedLocationId?: number;
}

export function LocationSelector({ onLocationSelect, selectedLocationId }: LocationSelectorProps) {
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [sectors, setSectors] = useState<Location[]>([]);
  const [cells, setCells] = useState<Location[]>([]);
  const [villages, setVillages] = useState<Location[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCell, setSelectedCell] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');

  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:8080/api/locations/hierarchy', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProvinces(data);
        } else {
          setProvinces([]);
        }
      })
      .catch(err => {
        console.error('Error loading locations:', err);
        setProvinces([]);
      });
  }, [token]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    setSelectedProvince(provinceId);
    setSelectedDistrict('');
    setSelectedSector('');
    setSelectedCell('');
    setSelectedVillage('');
    setSectors([]);
    setCells([]);
    setVillages([]);

    if (provinceId) {
      const province = provinces.find(p => p.locationId.toString() === provinceId);
      setDistricts(province?.children || []);
      onLocationSelect(parseInt(provinceId));
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    setSelectedSector('');
    setSelectedCell('');
    setSelectedVillage('');
    setCells([]);
    setVillages([]);

    if (districtId) {
      const district = districts.find(d => d.locationId.toString() === districtId);
      setSectors(district?.children || []);
      onLocationSelect(parseInt(districtId));
    } else {
      setSectors([]);
    }
  };

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sectorId = e.target.value;
    setSelectedSector(sectorId);
    setSelectedCell('');
    setSelectedVillage('');
    setVillages([]);

    if (sectorId) {
      const sector = sectors.find(s => s.locationId.toString() === sectorId);
      setCells(sector?.children || []);
      onLocationSelect(parseInt(sectorId));
    } else {
      setCells([]);
    }
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cellId = e.target.value;
    setSelectedCell(cellId);
    setSelectedVillage('');

    if (cellId) {
      const cell = cells.find(c => c.locationId.toString() === cellId);
      setVillages(cell?.children || []);
      onLocationSelect(parseInt(cellId));
    } else {
      setVillages([]);
    }
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const villageId = e.target.value;
    setSelectedVillage(villageId);
    if (villageId) {
      onLocationSelect(parseInt(villageId));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
        <select
          value={selectedProvince}
          onChange={handleProvinceChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select Province</option>
          {provinces.map(province => (
            <option key={province.locationId} value={province.locationId}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      {districts.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select District</option>
            {districts.map(district => (
              <option key={district.locationId} value={district.locationId}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {sectors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
          <select
            value={selectedSector}
            onChange={handleSectorChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Sector</option>
            {sectors.map(sector => (
              <option key={sector.locationId} value={sector.locationId}>
                {sector.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {cells.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cell</label>
          <select
            value={selectedCell}
            onChange={handleCellChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Cell</option>
            {cells.map(cell => (
              <option key={cell.locationId} value={cell.locationId}>
                {cell.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {villages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
          <select
            value={selectedVillage}
            onChange={handleVillageChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Village</option>
            {villages.map(village => (
              <option key={village.locationId} value={village.locationId}>
                {village.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
