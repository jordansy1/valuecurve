import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface NewProjectFormProps {
  onCreated: () => void;
}

export default function NewProjectForm({ onCreated }: NewProjectFormProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), industry: industry.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      onCreated();
      setName('');
      setIndustry('');
      setOpen(false);
      navigate(`/admin/${data.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="card border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-gray-500 hover:text-primary min-h-[120px]"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">New Project</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card border-2 border-primary/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">New Project</h3>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
            Client / Project Name *
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            autoFocus
            required
          />
        </div>

        <div>
          <label htmlFor="project-industry" className="block text-sm font-medium text-gray-700 mb-1">
            Industry
          </label>
          <input
            id="project-industry"
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. SOC Management Platforms"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Project'
          )}
        </button>
      </div>
    </form>
  );
}
