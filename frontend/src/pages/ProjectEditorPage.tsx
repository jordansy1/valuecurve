import { useParams, Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useProject } from '../hooks/useProject';
import FeatureManager from '../components/admin/FeatureManager';
import CompetitorManager from '../components/admin/CompetitorManager';
import ValueMatrix from '../components/admin/ValueMatrix';
import ActionBar from '../components/admin/ActionBar';
import type { ValueCurveDataExtended } from '../types';

export default function ProjectEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, setData, loading, error, saving, saveError, setSaveError, save } = useProject(id);

  const update = (partial: Partial<ValueCurveDataExtended>) => {
    if (!data) return;
    setData({ ...data, ...partial });
  };

  // --- Feature handlers ---
  const handleAddFeature = (name: string) => {
    if (!data) return;
    const features = [...data.features, name];
    const user_jobs = [...(data.user_jobs || []), { name, description: '' }];
    const curves = data.curves.map((c) => ({
      ...c,
      relative_customer_value: [...c.relative_customer_value, 3],
    }));
    setData({ ...data, features, user_jobs, curves });
  };

  const handleRemoveFeature = (index: number) => {
    if (!data) return;
    const removedName = data.features[index];
    const features = data.features.filter((_, i) => i !== index);
    const user_jobs = (data.user_jobs || []).filter((_, i) => i !== index);
    const curves = data.curves.map((c) => ({
      ...c,
      relative_customer_value: c.relative_customer_value.filter((_, i) => i !== index),
    }));
    // Clean rationale for removed feature
    const rationale = { ...(data.rationale || {}) };
    for (const comp of Object.keys(rationale)) {
      if (rationale[comp][removedName]) {
        rationale[comp] = { ...rationale[comp] };
        delete rationale[comp][removedName];
      }
    }
    setData({ ...data, features, user_jobs, curves, rationale });
  };

  const handleUpdateFeature = (index: number, name: string, description: string) => {
    if (!data) return;
    const oldName = data.features[index];
    const features = [...data.features];
    features[index] = name;
    const user_jobs = [...(data.user_jobs || [])];
    user_jobs[index] = { name, description };

    // If feature renamed, update rationale keys
    let rationale = data.rationale;
    if (oldName !== name && rationale) {
      rationale = { ...rationale };
      for (const comp of Object.keys(rationale)) {
        if (rationale[comp][oldName] !== undefined) {
          rationale[comp] = { ...rationale[comp], [name]: rationale[comp][oldName] };
          delete rationale[comp][oldName];
        }
      }
    }

    setData({ ...data, features, user_jobs, rationale });
  };

  // --- Competitor handlers ---
  const handleAddCompetitor = (name: string) => {
    if (!data) return;
    const curves = [
      ...data.curves,
      {
        customer_profile: name,
        relative_customer_value: data.features.map(() => 3),
      },
    ];
    setData({ ...data, curves });
  };

  const handleRemoveCompetitor = (index: number) => {
    if (!data) return;
    const removedName = data.curves[index].customer_profile;
    const curves = data.curves.filter((_, i) => i !== index);
    const rationale = { ...(data.rationale || {}) };
    delete rationale[removedName];
    setData({ ...data, curves, rationale });
  };

  const handleRenameCompetitor = (index: number, name: string) => {
    if (!data) return;
    const oldName = data.curves[index].customer_profile;
    const curves = [...data.curves];
    curves[index] = { ...curves[index], customer_profile: name };

    // Update rationale key
    let rationale = data.rationale;
    if (oldName !== name && rationale && rationale[oldName]) {
      rationale = { ...rationale, [name]: rationale[oldName] };
      delete rationale[oldName];
    }

    setData({ ...data, curves, rationale });
  };

  // --- Value matrix handlers ---
  const handleValueChange = (curveIndex: number, featureIndex: number, value: number) => {
    if (!data) return;
    const curves = [...data.curves];
    const values = [...curves[curveIndex].relative_customer_value];
    values[featureIndex] = value;
    curves[curveIndex] = { ...curves[curveIndex], relative_customer_value: values };
    setData({ ...data, curves });
  };

  const handleRationaleChange = (competitor: string, feature: string, text: string) => {
    if (!data) return;
    const rationale = { ...(data.rationale || {}) };
    if (!rationale[competitor]) rationale[competitor] = {};
    rationale[competitor] = { ...rationale[competitor], [feature]: text };
    setData({ ...data, rationale });
  };

  // --- Save handler ---
  const handleSave = async () => {
    if (!data) return;
    setSaveError(null);
    await save(data);
  };

  const handleGenerate = async () => {
    if (!data || !id) return;
    setSaveError(null);
    const ok = await save(data);
    if (ok) {
      navigate(`/?project=${encodeURIComponent(id)}`);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="card text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{error || 'Project not found'}</p>
          <Link to="/admin" className="btn btn-primary">
            Back to Projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24">
      <div className="max-w-[900px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{id}</h2>
            <p className="text-sm text-gray-500">Edit project details, features, and competitors</p>
          </div>
        </div>

        {/* Project Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <input
                type="text"
                value={data.industry}
                onChange={(e) => update({ industry: e.target.value })}
                placeholder="e.g. SOC Management Platforms"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Persona
              </label>
              <input
                type="text"
                value={data.user_persona || ''}
                onChange={(e) => update({ user_persona: e.target.value })}
                placeholder="e.g. Security Analyst"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <FeatureManager
          features={data.features}
          userJobs={data.user_jobs || []}
          onAddFeature={handleAddFeature}
          onRemoveFeature={handleRemoveFeature}
          onUpdateFeature={handleUpdateFeature}
        />

        {/* Competitors */}
        <CompetitorManager
          competitors={data.curves.map((c) => c.customer_profile)}
          onAddCompetitor={handleAddCompetitor}
          onRemoveCompetitor={handleRemoveCompetitor}
          onRenameCompetitor={handleRenameCompetitor}
        />

        {/* Value Matrix */}
        <ValueMatrix
          features={data.features}
          curves={data.curves}
          rationale={data.rationale || {}}
          onValueChange={handleValueChange}
          onRationaleChange={handleRationaleChange}
        />

        {/* Save feedback */}
        {saveError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {saveError}
          </div>
        )}
      </div>

      <ActionBar
        saving={saving}
        onSave={handleSave}
        onGenerate={handleGenerate}
      />
    </main>
  );
}
