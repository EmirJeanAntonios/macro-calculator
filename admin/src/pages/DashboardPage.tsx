import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  Settings,
  TrendingUp,
  Users,
  Activity,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminService } from '../services/api';
import type { MacroResult } from '../types';

export default function DashboardPage() {
  const [recentRecords, setRecentRecords] = useState<MacroResult[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const response = await adminService.getRecords(1, 5);
    if (response.success && response.data) {
      setRecentRecords(response.data.data);
      setTotalRecords(response.data.pagination.total);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Overview of your macro calculator application
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Database}
          label="Total Calculations"
          value={totalRecords}
          color="violet"
        />
        <StatCard
          icon={Users}
          label="Unique Users"
          value={totalRecords}
          color="emerald"
          subtitle="Based on sessions"
        />
        <StatCard
          icon={Activity}
          label="Avg Daily Calories"
          value={
            recentRecords.length > 0
              ? Math.round(
                  recentRecords.reduce((sum, r) => sum + r.dailyCalories, 0) /
                    recentRecords.length
                )
              : 0
          }
          color="amber"
          suffix="kcal"
        />
        <StatCard
          icon={TrendingUp}
          label="This Week"
          value={recentRecords.length}
          color="cyan"
          subtitle="Recent calculations"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/records"
          className="group p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-violet-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-500/20 rounded-xl">
                <Database className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Manage Records
                </h3>
                <p className="text-sm text-slate-400">
                  View, search and delete calculation records
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-violet-400 transition-colors" />
          </div>
        </Link>

        <Link
          to="/config"
          className="group p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Settings className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Configuration
                </h3>
                <p className="text-sm text-slate-400">
                  Adjust workout intensities and macro ratios
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent Records */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Calculations</h2>
          <Link
            to="/records"
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
        ) : recentRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No calculations yet
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {recentRecords.map((record) => (
              <div
                key={record.id}
                className="px-6 py-4 hover:bg-slate-700/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {record.userInput?.age || '?'}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {record.dailyCalories} kcal/day
                      </p>
                      <p className="text-sm text-slate-500">
                        {record.userInput?.gender} • {record.userInput?.goal?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">
                      {formatDate(record.calculatedAt)}
                    </p>
                    <p className="text-xs text-slate-600 font-mono">
                      {record.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'violet' | 'emerald' | 'amber' | 'cyan';
  subtitle?: string;
  suffix?: string;
}

function StatCard({ icon: Icon, label, value, color, subtitle, suffix }: StatCardProps) {
  const colorClasses = {
    violet: 'bg-violet-500/20 text-violet-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-3xl font-bold text-white">
          {value.toLocaleString()}
          {suffix && <span className="text-lg text-slate-500 ml-1">{suffix}</span>}
        </p>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

