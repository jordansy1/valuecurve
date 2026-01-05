import { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import Header from './components/Header';
import ValueCurveChart from './components/ValueCurveChart';
import CompetitorSidebar from './components/CompetitorSidebar';
import type { ValueCurveData, HighlightMode } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [data, setData] = useState<ValueCurveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCompetitors, setVisibleCompetitors] = useState<Set<string>>(new Set());
  const [highlightMode, setHighlightMode] = useState<HighlightMode>('none');

  // Fetch data from Flask API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/data`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData: ValueCurveData = await response.json();
        setData(jsonData);

        // Initialize with all competitors visible
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
  }, []);

  // Competitor toggle handlers
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading value curve data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
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
      </div>
    );
  }

  // Main application view
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Header />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Industry Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700 italic">
              {data.industry}
            </h2>
          </div>

          {/* Main Content Grid - Responsive Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Chart Container */}
            <div className="flex-1 card min-h-[500px] lg:min-h-[600px]">
              <ValueCurveChart
                data={data}
                visibleCompetitors={visibleCompetitors}
                highlightMode={highlightMode}
              />
            </div>

            {/* Sidebar */}
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

          {/* User Jobs Descriptions */}
          {data.user_jobs && data.user_jobs.length > 0 && (
            <div className="mt-8 card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">
                Key User Jobs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.user_jobs.map((job, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <h4 className="font-medium text-gray-800 mb-2">{job.name}</h4>
                    <p className="text-sm text-gray-600">{job.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500">
        <p>Generated by EverettYoung LLC Value Curve App</p>
      </footer>
    </div>
  );
}

export default App;
