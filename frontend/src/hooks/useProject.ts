import { useState, useEffect, useCallback } from 'react';
import type { ValueCurveDataExtended } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useProject(projectName: string | undefined) {
  const [data, setData] = useState<ValueCurveDataExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectName) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/data`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectName]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const save = useCallback(
    async (updatedData: ValueCurveDataExtended): Promise<boolean> => {
      if (!projectName) return false;
      try {
        setSaving(true);
        setSaveError(null);
        const res = await fetch(
          `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/data`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
          }
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.details ? body.details.join('; ') : body.error || `HTTP ${res.status}`
          );
        }
        return true;
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to save');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [projectName]
  );

  return { data, setData, loading, error, saving, saveError, setSaveError, save, refetch: fetchProject };
}
