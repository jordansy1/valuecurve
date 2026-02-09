import { Loader2, Save, BarChart3 } from 'lucide-react';

interface ActionBarProps {
  saving: boolean;
  onSave: () => void;
  onGenerate: () => void;
  disabled?: boolean;
}

export default function ActionBar({ saving, onSave, onGenerate, disabled }: ActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-end gap-3">
        <button
          onClick={onSave}
          disabled={saving || disabled}
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Draft
        </button>
        <button
          onClick={onGenerate}
          disabled={saving || disabled}
          className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <BarChart3 className="w-4 h-4" />
          Generate Value Curve
        </button>
      </div>
    </div>
  );
}
