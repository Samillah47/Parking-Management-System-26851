import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ParkingSquare, FileText, Car, Calendar, LogIn, LogOut as ExitIcon, UserCircle, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
export function Sidebar() {
  const {
    user
  } = useAuth();
  const adminLinks = [{
    to: '/admin/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard'
  }, {
    to: '/admin/users',
    icon: Users,
    label: 'Users'
  }, {
    to: '/admin/spots',
    icon: ParkingSquare,
    label: 'Parking Spots'
  }, {
    to: '/admin/reports',
    icon: FileText,
    label: 'Reports'
  }, {
    to: '/admin/profile',
    icon: UserCircle,
    label: 'Profile'
  }];
  const staffLinks = [{
    to: '/staff/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard'
  }, {
    to: '/staff/assign',
    icon: LogIn,
    label: 'Assign Spot'
  }, {
    to: '/staff/exit',
    icon: ExitIcon,
    label: 'Process Exit'
  }, {
    to: '/staff/profile',
    icon: UserCircle,
    label: 'Profile'
  }];
  const userLinks = [{
    to: '/user/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard'
  }, {
    to: '/user/reservations',
    icon: Calendar,
    label: 'Reservations'
  }, {
    to: '/user/vehicles',
    icon: Car,
    label: 'My Vehicles'
  }, {
    to: '/user/spots',
    icon: MapPin,
    label: 'Parking Spots'
  }, {
    to: '/user/profile',
    icon: UserCircle,
    label: 'Profile'
  }];
  const links = user?.role === 'ADMIN' ? adminLinks : user?.role === 'STAFF' ? staffLinks : userLinks;
  return <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <nav className="space-y-2">
        {links.map(link => <NavLink key={link.to} to={link.to} className={({
        isActive
      }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>)}
      </nav>
    </aside>;
}