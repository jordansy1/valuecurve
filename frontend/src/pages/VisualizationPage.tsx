import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import ValueCurveChart from '../components/ValueCurveChart';
import CompetitorSidebar from '../components/CompetitorSidebar';
import type { ValueCurveData, HighlightMode } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VisualizationPage() {
  const [searchParams] = useSearchParams();
  const projectName = searchParams.get('project');

  const [data, setData] = useState<ValueCurveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCompetitors, setVisibleCompetitors] = useState<Set<string>>(new Set());
  const [highlightMode, setHighlightMode] = useState<HighlightMode>('none');
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = projectName
          ? `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/data`
          : `${API_BASE_URL}/api/data`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData: ValueCurveData = await response.json();
        setData(jsonData);

        const allCompetitors = new Set(jsonData.curves.map(c => c.customer_profile));
        setVisibleCompetitors(allCompetitors);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectName]);

  const handleToggleCompetitor = (name: string) => {
    setVisibleCompetitors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (data) {
      setVisibleCompetitors(new Set(data.curves.map(c => c.customer_profile)));
    }
  };

  const handleClearAll = () => {
    setVisibleCompetitors(new Set());
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading value curve data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full card text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Unable to Load Data
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'No data available'}
          </p>
          <p className="text-sm text-gray-500">
            Make sure the Flask backend is running on port 5000 with a valid data file.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 card min-h-[500px] lg:min-h-[600px] flex flex-col">
            <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
              {data.industry}
            </h2>
            <div className="flex-1 min-h-0">
              <ValueCurveChart
                data={data}
                visibleCompetitors={visibleCompetitors}
                highlightMode={highlightMode}
                onHighlightedIndicesChange={setHighlightedIndices}
              />
            </div>
          </div>

          <CompetitorSidebar
            data={data}
            visibleCompetitors={visibleCompetitors}
            onToggleCompetitor={handleToggleCompetitor}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
            highlightMode={highlightMode}
            onHighlightModeChange={setHighlightMode}
          />
        </div>

        {data.user_jobs && data.user_jobs.length > 0 && (
          <div className="mt-8 card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">
              Key User Jobs
              {highlightMode !== 'none' && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({highlightMode === 'advantage' ? 'Areas of Advantage' : 'Areas of Disadvantage'})
                </span>
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.user_jobs
                .filter((_, index) =>
                  highlightMode === 'none' || highlightedIndices.includes(index)
                )
                .map((job, filteredIndex) => {
                  const originalIndex = data.user_jobs!.findIndex(j => j.name === job.name);
                  const isHighlighted = highlightedIndices.includes(originalIndex);

                  return (
                    <div
                      key={filteredIndex}
                      className={`p-4 rounded-lg border ${
                        highlightMode === 'advantage' && isHighlighted
                          ? 'bg-green-50 border-green-200'
                          : highlightMode === 'disadvantage' && isHighlighted
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <h4 className="font-bold text-gray-800 mb-2">{job.name}</h4>
                      <p className="text-sm text-gray-600">{job.description}</p>
                    </div>
                  );
                })}
            </div>
            {highlightMode !== 'none' && highlightedIndices.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No {highlightMode === 'advantage' ? 'advantages' : 'disadvantages'} found with the current threshold.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
