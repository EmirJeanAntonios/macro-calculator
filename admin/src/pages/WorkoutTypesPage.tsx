import { useEffect, useState } from 'react';
import {
  Plus,
  Save,
  Trash2,
  Edit2,
  X,
  Loader2,
  AlertCircle,
  Dumbbell,
  Check,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminService } from '../services/api';
import type { WorkoutCategory, CreateWorkoutCategoryDto, UpdateWorkoutCategoryDto } from '../services/api';

const ICON_OPTIONS = [
  'Dumbbell', 'Heart', 'Zap', 'Flame', 'Moon', 'Footprints', 'Bike', 'Waves',
  'PersonStanding', 'Music', 'Mountain', 'Trophy', 'Hand', 'Swords', 'Sparkles', 'MoreHorizontal',
];

const COLOR_OPTIONS = [
  { name: 'slate', class: 'bg-slate-500' },
  { name: 'gray', class: 'bg-gray-500' },
  { name: 'red', class: 'bg-red-500' },
  { name: 'orange', class: 'bg-orange-500' },
  { name: 'amber', class: 'bg-amber-500' },
  { name: 'yellow', class: 'bg-yellow-500' },
  { name: 'lime', class: 'bg-lime-500' },
  { name: 'green', class: 'bg-green-500' },
  { name: 'emerald', class: 'bg-emerald-500' },
  { name: 'cyan', class: 'bg-cyan-500' },
  { name: 'blue', class: 'bg-blue-500' },
  { name: 'indigo', class: 'bg-indigo-500' },
  { name: 'violet', class: 'bg-violet-500' },
  { name: 'purple', class: 'bg-purple-500' },
  { name: 'fuchsia', class: 'bg-fuchsia-500' },
  { name: 'pink', class: 'bg-pink-500' },
  { name: 'rose', class: 'bg-rose-500' },
];

export default function WorkoutTypesPage() {
  const [categories, setCategories] = useState<WorkoutCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateWorkoutCategoryDto>({
    key: '',
    name: '',
    intensity: 1.0,
    icon: 'Dumbbell',
    color: 'blue',
    description: '',
    sortOrder: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    const response = await adminService.getWorkoutCategories(true);
    if (response.success && response.data) {
      setCategories(response.data);
    } else {
      setError(response.error || 'Failed to load workout categories');
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      key: '',
      name: '',
      intensity: 1.0,
      icon: 'Dumbbell',
      color: 'blue',
      description: '',
      sortOrder: 0,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  const startEdit = (category: WorkoutCategory) => {
    setFormData({
      key: category.key,
      name: category.name,
      intensity: typeof category.intensity === 'string' ? parseFloat(category.intensity) : category.intensity,
      icon: category.icon || 'Dumbbell',
      color: category.color || 'blue',
      description: category.description || '',
      sortOrder: category.sortOrder,
    });
    setEditingId(category.id);
    setIsCreating(false);
  };

  const startCreate = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      sortOrder: categories.length,
    }));
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!formData.key || !formData.name) {
      setError('Key and Name are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    if (editingId) {
      // Update existing
      const dto: UpdateWorkoutCategoryDto = {
        name: formData.name,
        intensity: formData.intensity,
        icon: formData.icon,
        color: formData.color,
        description: formData.description,
        sortOrder: formData.sortOrder,
      };
      const response = await adminService.updateWorkoutCategory(editingId, dto);
      if (response.success) {
        await loadCategories();
        resetForm();
      } else {
        setError(response.error || 'Failed to update');
      }
    } else {
      // Create new
      const response = await adminService.createWorkoutCategory(formData);
      if (response.success) {
        await loadCategories();
        resetForm();
      } else {
        setError(response.error || 'Failed to create');
      }
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const response = await adminService.deleteWorkoutCategory(deleteId);
    if (response.success) {
      setCategories(prev => prev.filter(c => c.id !== deleteId));
    } else {
      setError(response.error || 'Failed to delete');
    }
    setDeleteId(null);
    setIsDeleting(false);
  };

  const handleToggleActive = async (category: WorkoutCategory) => {
    const response = await adminService.updateWorkoutCategory(category.id, {
      isActive: !category.isActive,
    });
    if (response.success) {
      setCategories(prev =>
        prev.map(c => (c.id === category.id ? { ...c, isActive: !c.isActive } : c))
      );
    }
  };

  const getColorClass = (color: string | null) => {
    const found = COLOR_OPTIONS.find(c => c.name === color);
    return found?.class || 'bg-gray-500';
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Workout Types</h1>
          <p className="text-slate-400">
            Manage workout categories and their intensity multipliers
          </p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Workout Type
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="mb-6 bg-slate-800/50 rounded-2xl border border-violet-500/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Workout Type' : 'Add New Workout Type'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Key */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Key (unique identifier)</label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                disabled={!!editingId}
                placeholder="e.g., kettlebell"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Display Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Kettlebell Training"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Intensity (0.1 - 3.0)</label>
              <input
                type="number"
                value={formData.intensity}
                onChange={(e) => setFormData({ ...formData, intensity: parseFloat(e.target.value) || 1.0 })}
                min="0.1"
                max="3.0"
                step="0.1"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {ICON_OPTIONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Color</label>
              <div className="flex flex-wrap gap-1">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.name })}
                    className={`w-6 h-6 rounded ${color.class} ${formData.color === color.name ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Very vigorous (~10-12 METs)"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center">
            <Dumbbell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No workout types found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Intensity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className={`hover:bg-slate-700/20 transition-colors ${!category.isActive ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-slate-500 text-sm">
                      {category.sortOrder}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${getColorClass(category.color)} flex items-center justify-center`}>
                          <Dumbbell className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-medium">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm font-mono">
                      {category.key}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-violet-500/20 text-violet-400 text-sm rounded-lg font-medium">
                        {typeof category.intensity === 'string' ? parseFloat(category.intensity).toFixed(1) : category.intensity.toFixed(1)}x
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-sm max-w-xs truncate">
                      {category.description}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(category)}
                        disabled={category.isDefault}
                        className={`px-2 py-1 text-xs rounded-full ${
                          category.isActive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-500/20 text-slate-400'
                        } ${category.isDefault ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(category)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!category.isDefault && (
                          <button
                            onClick={() => setDeleteId(category.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {category.isDefault && (
                          <span className="p-2 text-slate-600" title="Default types cannot be deleted">
                            <Check className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-2">
              Delete Workout Type?
            </h3>
            <p className="text-slate-400 mb-6">
              This action cannot be undone. Existing workout records using this type will still reference it by key.
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


