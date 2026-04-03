import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import * as types from '../../../shared/types';

const Packages: React.FC = () => {
  const { packages, setPackages, savePackage, deletePackage } = useStore();
  const [editingPackage, setEditingPackage] = useState<types.Package | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreate = () => {
    const newPkg: types.Package = {
      id: `pkg-${Date.now()}`,
      name: 'New Package',
      price: 0,
      photoCount: 4,
      printCount: 1,
      digitalCopy: true,
      isActive: true,
      sortOrder: packages.length + 1
    };
    setEditingPackage(newPkg);
    setIsFormOpen(true);
  };

  const handleEdit = (pkg: types.Package) => {
    setEditingPackage({ ...pkg });
    setIsFormOpen(true);
  };

  const handleSave = async (pkg: types.Package) => {
    try {
      await savePackage(pkg);
      // Reload packages
      const updated = await window.electronAPI.db.getPackages();
      setPackages(updated);
      setIsFormOpen(false);
      setEditingPackage(null);
    } catch (error) {
      alert(`Failed to save: ${error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      await deletePackage(id);
      const updated = await window.electronAPI.db.getPackages();
      setPackages(updated);
    } catch (error) {
      alert(`Failed to delete: ${error}`);
    }
  };

  const handleToggleActive = async (pkg: types.Package) => {
    const updated = { ...pkg, isActive: !pkg.isActive };
    await handleSave(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-bold">Package Management</h2>
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-xl font-semibold transition-colors"
        >
          + Add Package
        </button>
      </div>

      {/* Packages table */}
      <div className="bg-gray-800 rounded-2xl overflow-hidden">
        {packages.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No packages configured. Click "Add Package" to create one.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-400">Name</th>
                <th className="text-left px-6 py-4 text-sm text-gray-400">Price</th>
                <th className="text-left px-6 py-4 text-sm text-gray-400">Photos</th>
                <th className="text-left px-6 py-4 text-sm text-gray-400">Prints</th>
                <th className="text-left px-6 py-4 text-sm text-gray-400">Digital</th>
                <th className="text-left px-6 py-4 text-sm text-gray-400">Status</th>
                <th className="text-left px-6 py-4 text-sm text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="border-t border-gray-700/50 hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div className="font-semibold">{pkg.name}</div>
                  </td>
                  <td className="px-6 py-4 font-mono">
                    Rp {pkg.price.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">{pkg.photoCount}</td>
                  <td className="px-6 py-4">{pkg.printCount}</td>
                  <td className="px-6 py-4">
                    {pkg.digitalCopy ? '✅ Yes' : '❌ No'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(pkg)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pkg.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-600 text-gray-400'
                      }`}
                    >
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit modal */}
      {isFormOpen && editingPackage && (
        <PackageForm
          pkg={editingPackage}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingPackage(null);
          }}
        />
      )}
    </div>
  );
};

interface PackageFormProps {
  pkg: types.Package;
  onSave: (pkg: types.Package) => Promise<void>;
  onCancel: () => void;
}

const PackageForm: React.FC<PackageFormProps> = ({ pkg, onSave, onCancel }) => {
  const [formData, setFormData] = useState(pkg);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full">
        <h3 className="text-2xl font-bold mb-6">
          {pkg.id.startsWith('pkg-') ? 'Create Package' : 'Edit Package'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Package Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Price (Rp)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Photo Count</label>
              <input
                type="number"
                value={formData.photoCount}
                onChange={(e) => setFormData({ ...formData, photoCount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Print Count</label>
              <input
                type="number"
                value={formData.printCount}
                onChange={(e) => setFormData({ ...formData, printCount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="digitalCopy"
              checked={formData.digitalCopy}
              onChange={(e) => setFormData({ ...formData, digitalCopy: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <label htmlFor="digitalCopy" className="text-sm">Include digital copy</label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <label htmlFor="isActive" className="text-sm">Active (shown to customers)</label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-xl"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Packages;
