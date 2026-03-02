import { useState } from 'react';
import { Plus, Trash2, Shield } from 'lucide-react';
import { isOurSolution } from '../../types';
import ConfirmDialog from './ConfirmDialog';

interface CompetitorManagerProps {
  competitors: string[];
  onAddCompetitor: (name: string) => void;
  onRemoveCompetitor: (index: number) => void;
  onRenameCompetitor: (index: number, name: string) => void;
}

export default function CompetitorManager({
  competitors,
  onAddCompetitor,
  onRemoveCompetitor,
  onRenameCompetitor,
}: CompetitorManagerProps) {
  const [newName, setNewName] = useState('');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    onAddCompetitor(name);
    setNewName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Competitors</h3>

      <div className="space-y-2">
        {competitors.map((name, index) => {
          const isProtected = isOurSolution(name);
          return (
            <div key={index} className="flex items-center gap-2">
              {isProtected ? (
                <>
                  <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="flex-1 px-3 py-2 border border-green-200 bg-green-50 rounded text-sm font-medium text-green-800">
                    {name}
                  </span>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => onRenameCompetitor(index, e.target.value)}
                    placeholder="Competitor name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                  />
                  <button
                    onClick={() => setDeleteIndex(index)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="Remove competitor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a competitor..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="btn btn-accent flex items-center gap-1 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <ConfirmDialog
        open={deleteIndex !== null}
        title="Remove Competitor"
        message={
          deleteIndex !== null
            ? `Remove "${competitors[deleteIndex]}"? This will also remove all their values and rationale.`
            : ''
        }
        confirmLabel="Remove"
        onConfirm={() => {
          if (deleteIndex !== null) {
            onRemoveCompetitor(deleteIndex);
            setDeleteIndex(null);
          }
        }}
        onCancel={() => setDeleteIndex(null)}
      />
    </div>
  );
}
