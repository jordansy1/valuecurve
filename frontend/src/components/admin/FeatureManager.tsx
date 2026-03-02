import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { UserJob } from '../../types';
import ConfirmDialog from './ConfirmDialog';

interface FeatureManagerProps {
  features: string[];
  userJobs: UserJob[];
  onAddFeature: (name: string) => void;
  onRemoveFeature: (index: number) => void;
  onUpdateFeature: (index: number, name: string, description: string) => void;
}

export default function FeatureManager({
  features,
  userJobs,
  onAddFeature,
  onRemoveFeature,
  onUpdateFeature,
}: FeatureManagerProps) {
  const [newFeatureName, setNewFeatureName] = useState('');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleAdd = () => {
    const name = newFeatureName.trim();
    if (!name) return;
    onAddFeature(name);
    setNewFeatureName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Features / User Jobs</h3>

      {features.length === 0 && (
        <p className="text-sm text-gray-400 mb-4">No features yet. Add your first one below.</p>
      )}

      <div className="space-y-3">
        {features.map((feature, index) => {
          const job = userJobs[index];
          return (
            <div key={index} className="flex items-start gap-2 group">
              <GripVertical className="w-4 h-4 text-gray-300 mt-2.5 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) =>
                    onUpdateFeature(index, e.target.value, job?.description || '')
                  }
                  placeholder="Feature name"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                />
                <input
                  type="text"
                  value={job?.description || ''}
                  onChange={(e) =>
                    onUpdateFeature(index, feature, e.target.value)
                  }
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm text-gray-500"
                />
              </div>
              <button
                onClick={() => setDeleteIndex(index)}
                className="text-gray-300 hover:text-red-500 transition-colors mt-2"
                title="Remove feature"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={newFeatureName}
          onChange={(e) => setNewFeatureName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a feature..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
        />
        <button
          onClick={handleAdd}
          disabled={!newFeatureName.trim()}
          className="btn btn-accent flex items-center gap-1 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <ConfirmDialog
        open={deleteIndex !== null}
        title="Remove Feature"
        message={
          deleteIndex !== null
            ? `Remove "${features[deleteIndex]}"? This will also remove its values from all competitors.`
            : ''
        }
        confirmLabel="Remove"
        onConfirm={() => {
          if (deleteIndex !== null) {
            onRemoveFeature(deleteIndex);
            setDeleteIndex(null);
          }
        }}
        onCancel={() => setDeleteIndex(null)}
      />
    </div>
  );
}
