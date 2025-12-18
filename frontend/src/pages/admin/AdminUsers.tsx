import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Filter, Edit, Trash2 } from 'lucide-react';

interface User {
  userId: number;
  username: string;
  email: string;
  role: string;
}

interface PageResponse {
  content: User[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const { token } = useAuth();

  // Column filters
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    role: '',
  });

  // Load users
  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const loadUsers = async () => {
      if (isMounted) setLoading(true);

      try {
        const response = await fetch(
          `http://localhost:8080/admin/users?page=${page}&size=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data: PageResponse = await response.json();

        if (isMounted) {
          setUsers(data.content);
          setTotalPages(data.totalPages);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error:', err);
        if (isMounted) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [token, page]);

  // Filter users
  const filteredUsers = users.filter((user) => {
    return (
      user.username.toLowerCase().includes(filters.username.toLowerCase()) &&
      user.email.toLowerCase().includes(filters.email.toLowerCase()) &&
      (filters.role === '' || user.role === filters.role)
    );
  });

  // Clear filters
  const clearFilters = () => {
    setFilters({ username: '', email: '', role: '' });
  };

  const hasActiveFilters = filters.username || filters.email || filters.role;

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`http://localhost:8080/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setUsers(users.filter(u => u.userId !== userId));
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting user');
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            {filteredUsers.length} of {users.length} users
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="mr-2" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center flex-wrap gap-2 text-sm text-blue-700">
            <Filter size={16} />
            <span className="font-medium">Filters:</span>
            {filters.username && (
              <span className="px-2 py-1 bg-blue-100 rounded text-xs">
                Username: "{filters.username}"
              </span>
            )}
            {filters.email && (
              <span className="px-2 py-1 bg-blue-100 rounded text-xs">
                Email: "{filters.email}"
              </span>
            )}
            {filters.role && (
              <span className="px-2 py-1 bg-blue-100 rounded text-xs">
                Role: {filters.role}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              {/* Headers */}
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>

              {/* FILTER ROW */}
              <tr className="bg-white border-b-2 border-gray-300">
                <th className="px-6 py-2">
                  <input
                    type="text"
                    placeholder="Filter username..."
                    value={filters.username}
                    onChange={(e) =>
                      setFilters({ ...filters, username: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-normal"
                  />
                </th>
                <th className="px-6 py-2">
                  <input
                    type="text"
                    placeholder="Filter email..."
                    value={filters.email}
                    onChange={(e) =>
                      setFilters({ ...filters, email: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-normal"
                  />
                </th>
                <th className="px-6 py-2">
                  <select
                    value={filters.role}
                    onChange={(e) =>
                      setFilters({ ...filters, role: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-normal"
                  >
                    <option value="">All Roles</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                    <option value="USER">USER</option>
                  </select>
                </th>
                <th className="px-6 py-2"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    {hasActiveFilters ? 'No users match your filters' : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{user.username}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{user.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleDeleteUser(user.userId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}