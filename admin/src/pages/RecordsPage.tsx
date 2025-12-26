import { useEffect, useState } from 'react';
import {
  Search,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Flame,
  ExternalLink,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminService } from '../services/api';
import type { MacroResult } from '../types';

export default function RecordsPage() {
  const [records, setRecords] = useState<MacroResult[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadRecords();
  }, [pagination.page]);

  const loadRecords = async () => {
    setIsLoading(true);
    const response = await adminService.getRecords(pagination.page, pagination.limit);
    if (response.success && response.data) {
      const { data: recordsData, pagination: paginationData } = response.data;
      setRecords(recordsData);
      setPagination((prev) => ({
        ...prev,
        ...paginationData,
      }));
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const response = await adminService.deleteRecord(deleteId);
    if (response.success) {
      setRecords((prev) => prev.filter((r) => r.id !== deleteId));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    }
    setDeleteId(null);
    setIsDeleting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGoalBadge = (goal?: string) => {
    switch (goal) {
      case 'weight_loss':
        return (
          <span className="px-2 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-full">
            Weight Loss
          </span>
        );
      case 'muscle_gain':
        return (
          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
            Muscle Gain
          </span>
        );
      case 'maintenance':
        return (
          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
            Maintenance
          </span>
        );
      default:
        return null;
    }
  };

  const filteredRecords = records.filter((record) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      record.id.toLowerCase().includes(term) ||
      record.userInput?.gender?.toLowerCase().includes(term) ||
      record.userInput?.goal?.toLowerCase().includes(term) ||
      String(record.dailyCalories).includes(term)
    );
  });

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Records</h1>
        <p className="text-slate-400">
          Manage all macro calculation records ({pagination.total} total)
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, goal, or calories..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-20 text-center">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    User Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Goal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Calories
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Macros
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                          {record.userInput?.age || '?'}
                        </div>
                        <div>
                          <p className="text-white font-medium capitalize">
                            {record.userInput?.gender || 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {record.userInput?.weight}
                            {record.userInput?.weightUnit} •{' '}
                            {record.userInput?.height}
                            {record.userInput?.heightUnit}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getGoalBadge(record.userInput?.goal)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-semibold">
                          {record.dailyCalories}
                        </span>
                        <span className="text-slate-500 text-sm">kcal</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-indigo-400">
                          P: {record.protein}g
                        </span>
                        <span className="text-amber-400">
                          C: {record.carbs}g
                        </span>
                        <span className="text-rose-400">F: {record.fats}g</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400 text-sm">
                        {formatDate(record.calculatedAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/results/${record.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          title="View in App"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setDeleteId(record.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} records
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-3 py-1 bg-slate-700 rounded-lg text-white text-sm">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-2">
              Delete Record?
            </h3>
            <p className="text-slate-400 mb-6">
              This action cannot be undone. The calculation record will be
              permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

