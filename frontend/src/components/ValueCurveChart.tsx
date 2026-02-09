import React, { useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { ValueCurveData, HighlightMode, ChartDataPoint, UserJob } from '../types';
import { isOurSolution, buildStyleMap } from '../types';

// Custom XAxis tick that shows feature description on hover
const FeatureTick = ({ x, y, payload, userJobs }: {
  x?: number;
  y?: number;
  payload?: { value: string };
  userJobs?: UserJob[];
}) => {
  const name = payload?.value || '';
  const job = userJobs?.find((j) => j.name === name);
  const description = job?.description || '';

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={8}
        textAnchor="end"
        fill="#2c3e50"
        fontSize={11}
        transform="rotate(-35)"
        style={{ cursor: description ? 'help' : 'default' }}
      >
        {name}
        {description && <title>{description}</title>}
      </text>
    </g>
  );
};

interface ValueCurveChartProps {
  data: ValueCurveData;
  visibleCompetitors: Set<string>;
  highlightMode: HighlightMode;
  onHighlightedIndicesChange?: (indices: number[]) => void;
}


const ValueCurveChart: React.FC<ValueCurveChartProps> = ({
  data,
  visibleCompetitors,
  highlightMode,
  onHighlightedIndicesChange,
}) => {
  // Build stable style map from shared config
  const styleMap = useMemo(() => buildStyleMap(data.curves), [data.curves]);

  // Transform data for Recharts format - include highlight info
  const chartData = useMemo(() => {
    return data.features.map((feature, index) => {
      const dataPoint: ChartDataPoint & { featureIndex: number } = {
        feature,
        featureIndex: index,
      };
      data.curves.forEach((curve) => {
        dataPoint[curve.customer_profile] = curve.relative_customer_value[index];
      });
      return dataPoint;
    });
  }, [data]);

  // Find "Our Solution" or "Blue Ocean" curve for highlighting
  const ourSolution = useMemo(() => {
    return data.curves.find(
      (c) =>
        c.customer_profile.includes('Our Solution') ||
        c.customer_profile.includes('Blue Ocean')
    );
  }, [data.curves]);

  // Calculate qualifying indices for highlighting
  const qualifyingIndices = useMemo(() => {
    if (highlightMode === 'none' || !ourSolution) {
      return [];
    }

    const threshold = 1.0;
    const indices: number[] = [];

    data.features.forEach((_, index) => {
      const ourValue = ourSolution.relative_customer_value[index];
      const competitorValues = data.curves
        .filter((c) => c.customer_profile !== ourSolution.customer_profile)
        .map((c) => c.relative_customer_value[index]);

      if (competitorValues.length === 0) return;

      const maxCompetitor = Math.max(...competitorValues);
      const minCompetitor = Math.min(...competitorValues);

      // ADVANTAGE: Our Solution beats ALL competitors (higher than the highest)
      // DISADVANTAGE: Our Solution loses to ALL competitors (lower than the lowest)
      if (
        (highlightMode === 'advantage' && ourValue - maxCompetitor >= threshold) ||
        (highlightMode === 'disadvantage' && minCompetitor - ourValue >= threshold)
      ) {
        indices.push(index);
      }
    });

    return indices;
  }, [data, ourSolution, highlightMode]);

  // Notify parent component of highlighted indices changes
  useEffect(() => {
    if (onHighlightedIndicesChange) {
      onHighlightedIndicesChange(qualifyingIndices);
    }
  }, [qualifyingIndices, onHighlightedIndicesChange]);

  // Get highlight color
  const highlightColor = highlightMode === 'advantage' ? '#27ae60' : '#e74c3c';

  return (
    <div className="w-full h-full pl-12 flex flex-col [&_svg]:!overflow-visible">
      <ResponsiveContainer width="100%" height="100%" className="flex-1 min-h-0">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 40, left: 70, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />

          {/* Render vertical highlight lines for each qualifying feature */}
          {highlightMode !== 'none' && qualifyingIndices.map((featureIndex) => (
            <ReferenceLine
              key={`highlight-${featureIndex}`}
              x={data.features[featureIndex]}
              stroke={highlightColor}
              strokeWidth={40}
              strokeOpacity={0.2}
            />
          ))}

          <XAxis
            dataKey="feature"
            angle={-35}
            textAnchor="end"
            height={80}
            interval={0}
            tick={<FeatureTick userJobs={data.user_jobs} />}
            tickMargin={8}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
            tick={{ fill: '#2c3e50', fontSize: 12 }}
            label={{
              value: 'Relative Customer Value',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#2c3e50', fontWeight: 600 },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '12px',
            }}
          />

          {/* Render lines - "Our Solution" solid green, competitors dashed with distinct colors */}
          {data.curves
            .filter((curve) => visibleCompetitors.has(curve.customer_profile))
            .map((curve) => {
              const style = styleMap.get(curve.customer_profile)!;
              return (
                <Line
                  key={curve.customer_profile}
                  type="monotone"
                  dataKey={curve.customer_profile}
                  stroke={style.color}
                  strokeWidth={style.strokeWidth}
                  strokeDasharray={style.strokeDasharray}
                  dot={{ r: isOurSolution(curve.customer_profile) ? 6 : 4, fill: style.color }}
                  activeDot={{ r: 8 }}
                />
              );
            })}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend showing line styles */}
      <div className="text-center mt-2 flex-shrink-0 pb-2">
        <p className="text-sm font-semibold text-gray-700 mb-2">Competitors</p>
        <div className="flex flex-wrap justify-center gap-5">
          {data.curves
            .filter((curve) => visibleCompetitors.has(curve.customer_profile))
            .map((curve) => {
              const style = styleMap.get(curve.customer_profile)!;
              return (
                <div key={curve.customer_profile} className="flex items-center gap-2">
                  <svg width="30" height="12">
                    <line
                      x1="0"
                      y1="6"
                      x2="30"
                      y2="6"
                      stroke={style.color}
                      strokeWidth={style.strokeWidth}
                      strokeDasharray={style.strokeDasharray}
                    />
                    <circle cx="15" cy="6" r={isOurSolution(curve.customer_profile) ? 4 : 3} fill={style.color} />
                  </svg>
                  <span className="text-xs text-gray-700 font-medium">{curve.customer_profile}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default ValueCurveChart;
