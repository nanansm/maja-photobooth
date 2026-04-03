import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import * as types from '../../../shared/types';

const Frames: React.FC = () => {
  const { frames, setFrames, saveFrame, deleteFrame } = useStore();
  const [uploading, setUploading] = useState(false);
  const [editingFrame, setEditingFrame] = useState<types.FrameTemplate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    // In a real implementation, this would open a file dialog
    // For now, we'll use demo data
    alert('Frame upload would open file dialog here. Add PNG overlay and JSON template.');
    setUploading(false);
  };

  const handleCreateFrame = () => {
    const newFrame: types.FrameTemplate = {
      id: `frame-${Date.now()}`,
      name: 'New Frame',
      previewImage: '',
      overlayImage: '',
      photoSlots: [
        { x: 50, y: 50, width: 400, height: 300 }
      ],
      canvasWidth: 500,
      canvasHeight: 700,
      isActive: true
    };
    setEditingFrame(newFrame);
    setIsFormOpen(true);
  };

  const handleSave = async (frame: types.FrameTemplate) => {
    try {
      await saveFrame(frame);
      // Reload frames
      const updated = await window.electronAPI.db.getFrames();
      setFrames(updated);
      setIsFormOpen(false);
      setEditingFrame(null);
    } catch (error) {
      alert(`Failed to save: ${error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this frame?')) return;

    try {
      await deleteFrame(id);
      const updated = await window.electronAPI.db.getFrames();
      setFrames(updated);
    } catch (error) {
      alert(`Failed to delete: ${error}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-bold">Frame Templates</h2>
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-colors"
          >
            {uploading ? '⏳ Uploading...' : '📤 Upload Frame'}
          </button>
          <button
            onClick={handleCreateFrame}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-xl font-semibold transition-colors"
          >
            + Add Frame
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
        <p className="text-blue-200">
          <strong>Frame format:</strong> Upload a PNG image with transparent areas where photos will appear.
          Create a matching JSON template with photo slot coordinates.
          Place frames in <code className="bg-gray-700 px-2 py-1 rounded">assets/frames/</code> directory.
        </p>
      </div>

      {/* Frames grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {frames.map((frame) => (
          <div
            key={frame.id}
            className="bg-gray-800 rounded-2xl overflow-hidden group"
          >
            <div className="aspect-square bg-gray-700 flex items-center justify-center">
              {frame.previewImage ? (
                <img
                  src={`file://${frame.previewImage}`}
                  alt={frame.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-6xl">🖼️</span>
              )}
            </div>

            <div className="p-4">
              <div className="font-semibold mb-3">{frame.name}</div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(frame)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(frame.id)}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {frames.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-6xl mb-4">🖼️</p>
          <p>No frames uploaded yet.</p>
          <p>Upload PNG frames with transparency or create new templates.</p>
        </div>
      )}

      {/* Edit modal */}
      {isFormOpen && editingFrame && (
        <FrameForm
          frame={editingFrame}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingFrame(null);
          }}
        />
      )}
    </div>
  );
};

interface FrameFormProps {
  frame: types.FrameTemplate;
  onSave: (frame: types.FrameTemplate) => Promise<void>;
  onCancel: () => void;
}

const FrameForm: React.FC<FrameFormProps> = ({ frame, onSave, onCancel }) => {
  const [formData, setFormData] = useState(frame);

  const addSlot = () => {
    setFormData({
      ...formData,
      photoSlots: [
        ...formData.photoSlots,
        { x: 50, y: 50, width: 200, height: 200 }
      ]
    });
  };

  const updateSlot = (index: number, slot: Partial<types.PhotoSlot>) => {
    const newSlots = [...formData.photoSlots];
    newSlots[index] = { ...newSlots[index], ...slot };
    setFormData({ ...formData, photoSlots: newSlots });
  };

  const removeSlot = (index: number) => {
    setFormData({
      ...formData,
      photoSlots: formData.photoSlots.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-4xl w-full my-8">
        <h3 className="text-2xl font-bold mb-6">
          {frame.id.startsWith('frame-') ? 'Create Frame' : 'Edit Frame'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Frame Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Preview Image (path)</label>
              <input
                type="text"
                value={formData.previewImage}
                onChange={(e) => setFormData({ ...formData, previewImage: e.target.value })}
                placeholder="assets/frames/preview.jpg"
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Overlay Image (PNG)</label>
              <input
                type="text"
                value={formData.overlayImage}
                onChange={(e) => setFormData({ ...formData, overlayImage: e.target.value })}
                placeholder="assets/frames/overlay.png"
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Canvas Width</label>
              <input
                type="number"
                value={formData.canvasWidth}
                onChange={(e) => setFormData({ ...formData, canvasWidth: parseInt(e.target.value) || 500 })}
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Canvas Height</label>
              <input
                type="number"
                value={formData.canvasHeight}
                onChange={(e) => setFormData({ ...formData, canvasHeight: parseInt(e.target.value) || 700 })}
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={addSlot}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl"
              >
                + Add Photo Slot
              </button>
            </div>
          </div>

          {/* Photo slots */}
          {formData.photoSlots.map((slot, idx) => (
            <div key={idx} className="bg-gray-700/50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Photo Slot {idx + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeSlot(idx)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-400">X</label>
                  <input
                    type="number"
                    value={slot.x}
                    onChange={(e) => updateSlot(idx, { x: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Y</label>
                  <input
                    type="number"
                    value={slot.y}
                    onChange={(e) => updateSlot(idx, { y: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Width</label>
                  <input
                    type="number"
                    value={slot.width}
                    onChange={(e) => updateSlot(idx, { width: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 bg-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Height</label>
                  <input
                    type="number"
                    value={slot.height}
                    onChange={(e) => updateSlot(idx, { height: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 bg-gray-600 rounded text-white"
                  />
                </div>
              </div>
            </div>
          ))}

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
              Save Frame
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Frames;
