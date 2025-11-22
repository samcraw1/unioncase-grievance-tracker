import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, User, BookOpen } from 'lucide-react';

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
      active: location.pathname === '/grievances/new',
      primary: true
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

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                item.primary
                  ? 'relative'
                  : item.active
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700 active:text-primary'
              }`}
            >
              {item.primary ? (
                <div className="absolute -top-6">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                    item.active ? 'bg-primary-dark' : 'bg-primary'
                  }`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <>
                  <Icon className={`h-6 w-6 ${item.active ? 'text-primary' : ''}`} />
                  <span className={`text-xs mt-1 font-medium ${
                    item.active ? 'text-primary' : ''
                  }`}>
                    {item.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
