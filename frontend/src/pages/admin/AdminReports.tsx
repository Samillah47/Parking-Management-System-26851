import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Download, Printer, Calendar, TrendingUp } from 'lucide-react';

interface RevenueReport {
  date: string;
  totalRevenue: number;
  totalReservations: number;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  number: number;
}

export function AdminReports() {
  const [reports, setReports] = useState<RevenueReport[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    fetch(`http://localhost:8080/admin/reports/revenue?startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then((data: any) => {
        if (data.dailyRevenue && data.reservationsByStatus) {
          const revenueArray = Object.entries(data.dailyRevenue).map(([date, revenue]) => {
            // Calculate reservations for this date
            const reservationsCount = Object.values(data.reservationsByStatus).reduce((sum: number, count) => sum + (count as number), 0);
            return {
              date,
              totalRevenue: revenue as number,
              totalReservations: Math.floor(reservationsCount / Object.keys(data.dailyRevenue).length)
            };
          });
          setReports(revenueArray);
        }
      })
      .catch(err => {
        console.error('Admin reports fetch error:', err);
        setReports([]);
      });
  }, [token, page]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const csvContent = [
      ['Date', 'Total Revenue (RWF)', 'Reservations'],
      ...reports.map(r => [r.date, r.totalRevenue, r.totalReservations])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalRevenue = reports.reduce((sum, r) => sum + r.totalRevenue, 0);
  const totalReservations = reports.reduce((sum, r) => sum + r.totalReservations, 0);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Reports</h1>
          <p className="text-gray-600 mt-1">Last 30 days financial overview</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer size={18} className="mr-2" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download size={18} className="mr-2" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-green-900 mt-2">RWF {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-700" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Reservations</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{totalReservations}</p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
              <Calendar className="text-blue-700" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Average per Day</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                RWF {reports.length > 0 ? Math.round(totalRevenue / reports.length).toLocaleString() : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">No report data available.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenue (RWF)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reservations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map(r => (
                  <tr key={r.date} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{r.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">RWF {r.totalRevenue.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{r.totalReservations}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}