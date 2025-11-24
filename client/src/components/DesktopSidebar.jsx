import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Plus, BookOpen, User, LogOut } from 'lucide-react';

const DesktopSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard',
      active: location.pathname === '/dashboard' || location.pathname === '/'
    },
    {
      icon: Plus,
      label: 'New Case',
      path: '/grievances/new',
      active: location.pathname === '/grievances/new'
    },
    {
      icon: BookOpen,
      label: 'Resources',
      path: '/resources',
      active: location.pathname === '/resources'
    },
    {
      icon: User,
      label: 'Settings',
      path: '/settings',
      active: location.pathname === '/settings'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex md:flex-col fixed inset-y-0 left-0 w-64 bg-primary text-white shadow-lg z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center space-x-3">
          <img
            src="/images/nalc-logo.png"
            alt="NALC Logo"
            className="h-12 w-12 rounded"
          />
          <div>
            <h1 className="text-lg font-bold">UnionCase</h1>
            <p className="text-xs text-blue-200">Grievance Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                item.active
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-blue-800">
        <div className="px-4 py-2 mb-2">
          <p className="text-sm font-medium text-white truncate">
            {user?.name || user?.email || 'User'}
          </p>
          <p className="text-xs text-blue-200 truncate">
            {user?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
