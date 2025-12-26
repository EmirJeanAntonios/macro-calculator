import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  Database,
  LogOut,
  Calculator,
  User,
  ExternalLink,
  Dumbbell,
} from 'lucide-react';
import { adminService } from '../services/api';

interface AdminLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/records', icon: Database, label: 'Records' },
  { path: '/workout-types', icon: Dumbbell, label: 'Workout Types' },
  { path: '/config', icon: Settings, label: 'Configuration' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = adminService.getCurrentUser();

  const handleLogout = () => {
    adminService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Macro Calculator</h1>
              <span className="text-xs text-slate-500">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}

          {/* External link to main app */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all mt-4"
          >
            <ExternalLink className="w-5 h-5" />
            <span className="font-medium">View App</span>
          </a>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30">
            <div className="p-2 bg-slate-700 rounded-full">
              <User className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.username || 'Admin'}
              </p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

