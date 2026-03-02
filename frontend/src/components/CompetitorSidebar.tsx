import React, { useMemo } from 'react';
import { CheckCircle2, Circle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ValueCurveData, HighlightMode } from '../types';
import { isOurSolution, buildStyleMap } from '../types';

interface CompetitorSidebarProps {
  data: ValueCurveData;
  visibleCompetitors: Set<string>;
  onToggleCompetitor: (name: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  highlightMode: HighlightMode;
  onHighlightModeChange: (mode: HighlightMode) => void;
}

const CompetitorSidebar: React.FC<CompetitorSidebarProps> = ({
  data,
  visibleCompetitors,
  onToggleCompetitor,
  onSelectAll,
  onClearAll,
  highlightMode,
  onHighlightModeChange,
}) => {
  const styleMap = useMemo(() => buildStyleMap(data.curves), [data.curves]);

  return (
    <div className="w-full lg:w-[280px] card space-y-6">
      {/* Competitors Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">
          Competitors
        </h3>

        {/* Select/Clear All Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={onSelectAll}
            className="flex-1 btn btn-primary text-sm"
          >
            Select All
          </button>
          <button
            onClick={onClearAll}
            className="flex-1 btn bg-neutral hover:bg-neutral/90 text-white text-sm"
          >
            Clear All
          </button>
        </div>

        {/* Competitor List */}
        <div className="space-y-2 max-h-[250px] overflow-y-auto">
          {data.curves.map((curve) => {
            const isVisible = visibleCompetitors.has(curve.customer_profile);
            const style = styleMap.get(curve.customer_profile)!;
            return (
              <label
                key={curve.customer_profile}
                className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => onToggleCompetitor(curve.customer_profile)}
                  className="sr-only"
                />
                <div className="mr-2">
                  {isVisible ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <svg width="24" height="12" className="mr-2 flex-shrink-0">
                  <line
                    x1="0"
                    y1="6"
                    x2="24"
                    y2="6"
                    stroke={style.color}
                    strokeWidth={style.strokeWidth}
                    strokeDasharray={style.strokeDasharray}
                  />
                  <circle
                    cx="12"
                    cy="6"
                    r={isOurSolution(curve.customer_profile) ? 3.5 : 2.5}
                    fill={style.color}
                  />
                </svg>
                <span className="text-sm text-gray-700 flex-1">
                  {curve.customer_profile}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Scope Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">
          Scope
        </h3>

        <div className="space-y-3">
          {/* No Highlighting */}
          <button
            onClick={() => onHighlightModeChange('none')}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              highlightMode === 'none'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Minus className="w-5 h-5" />
              <span className="text-sm font-medium">No Highlighting</span>
            </div>
          </button>

          {/* Areas of Advantage */}
          <button
            onClick={() => onHighlightModeChange('advantage')}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              highlightMode === 'advantage'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Areas of Advantage</span>
            </div>
          </button>

          {/* Areas of Disadvantage */}
          <button
            onClick={() => onHighlightModeChange('disadvantage')}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              highlightMode === 'disadvantage'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              <span className="text-sm font-medium">Areas of Disadvantage</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompetitorSidebar;
