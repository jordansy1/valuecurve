import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import ValueSlider from './ValueSlider';
import type { ValueCurve, CompetitorRationale } from '../../types';
import { isOurSolution } from '../../types';

interface ValueMatrixProps {
  features: string[];
  curves: ValueCurve[];
  rationale: Record<string, CompetitorRationale>;
  onValueChange: (curveIndex: number, featureIndex: number, value: number) => void;
  onRationaleChange: (competitor: string, feature: string, text: string) => void;
}

export default function ValueMatrix({
  features,
  curves,
  rationale,
  onValueChange,
  onRationaleChange,
}: ValueMatrixProps) {
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());

  const toggleCell = (key: string) => {
    setExpandedCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (features.length === 0 || curves.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Value Matrix</h3>
        <p className="text-sm text-gray-400">
          Add at least one feature and one competitor to start scoring.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Value Matrix</h3>
      <p className="text-sm text-gray-500 mb-6">
        Score each competitor on each feature (0 = no value, 5 = exceptional).
        Expand rows to add rationale.
      </p>

      <div className="space-y-6">
        {features.map((feature, fi) => (
          <div key={fi} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3 text-sm">{feature}</h4>
            <div className="space-y-3">
              {[...curves]
                .map((curve, ci) => ({ curve, ci }))
                .sort((a, b) => {
                  const aOur = isOurSolution(a.curve.customer_profile) ? 0 : 1;
                  const bOur = isOurSolution(b.curve.customer_profile) ? 0 : 1;
                  return aOur - bOur;
                })
                .map(({ curve, ci }) => {
                const cellKey = `${ci}-${fi}`;
                const isExpanded = expandedCells.has(cellKey);
                const competitorName = curve.customer_profile;
                const rationaleText = rationale[competitorName]?.[feature] || '';

                return (
                  <div key={ci} className="pl-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCell(cellKey)}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        title="Toggle rationale"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <span
                        className={`text-sm w-36 truncate flex-shrink-0 ${
                          isOurSolution(competitorName)
                            ? 'text-green-700 font-medium'
                            : 'text-gray-600'
                        }`}
                        title={competitorName}
                      >
                        {competitorName}
                      </span>
                      <ValueSlider
                        value={curve.relative_customer_value[fi] ?? 3}
                        onChange={(v) => onValueChange(ci, fi, v)}
                      />
                    </div>

                    {isExpanded && (
                      <div className="ml-7 mt-2">
                        <textarea
                          value={rationaleText}
                          onChange={(e) =>
                            onRationaleChange(competitorName, feature, e.target.value)
                          }
                          placeholder="Why this score? (optional)"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
