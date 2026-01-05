import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import type { ValueCurveData, HighlightMode, ChartDataPoint } from '../types';

interface ValueCurveChartProps {
  data: ValueCurveData;
  visibleCompetitors: Set<string>;
  highlightMode: HighlightMode;
}

// Color palette complementary to brand colors
const COLORS = [
  '#8484E6', // Primary purple
  '#A2C799', // Primary green
  '#587553', // Accent green
  '#B5BAD0', // Neutral light
  '#9297A8', // Neutral
  '#6B9BD1', // Blue
  '#E8A87C', // Orange
  '#D4A5D4', // Lavender
];

const ValueCurveChart: React.FC<ValueCurveChartProps> = ({
  data,
  visibleCompetitors,
  highlightMode,
}) => {
  // Transform data for Recharts format
  const chartData: ChartDataPoint[] = useMemo(() => {
    return data.features.map((feature, index) => {
      const dataPoint: ChartDataPoint = { feature };
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

  // Calculate advantage/disadvantage areas
  const highlightAreas = useMemo(() => {
    if (highlightMode === 'none' || !ourSolution) return [];

    const areas: Array<{ startFeature: string; endFeature: string; type: 'advantage' | 'disadvantage' }> = [];
    const threshold = 1.0;

    // Find indices that qualify for highlighting
    const qualifyingIndices: number[] = [];
    data.features.forEach((_, index) => {
      const ourValue = ourSolution.relative_customer_value[index];
      const competitorValues = data.curves
        .filter((c) => c.customer_profile !== ourSolution.customer_profile)
        .map((c) => c.relative_customer_value[index]);

      const maxCompetitor = Math.max(...competitorValues);
      const difference = ourValue - maxCompetitor;

      if (
        (highlightMode === 'advantage' && difference >= threshold) ||
        (highlightMode === 'disadvantage' && difference <= -threshold)
      ) {
        qualifyingIndices.push(index);
      }
    });

    // Group consecutive indices into ranges
    if (qualifyingIndices.length > 0) {
      let rangeStart = qualifyingIndices[0];
      let rangeEnd = qualifyingIndices[0];

      for (let i = 1; i <= qualifyingIndices.length; i++) {
        if (i < qualifyingIndices.length && qualifyingIndices[i] === rangeEnd + 1) {
          // Extend the current range
          rangeEnd = qualifyingIndices[i];
        } else {
          // End current range and create area
          // For ReferenceArea to work with categorical axis, we use feature names
          // and extend slightly before/after to make single points visible
          const startIdx = Math.max(0, rangeStart);
          const endIdx = Math.min(data.features.length - 1, rangeEnd);

          areas.push({
            startFeature: data.features[startIdx],
            endFeature: data.features[endIdx],
            type: highlightMode === 'advantage' ? 'advantage' : 'disadvantage',
          });

          // Start new range if there are more indices
          if (i < qualifyingIndices.length) {
            rangeStart = qualifyingIndices[i];
            rangeEnd = qualifyingIndices[i];
          }
        }
      }
    }

    return areas;
  }, [data, ourSolution, highlightMode]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
          <XAxis
            dataKey="feature"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: '#2c3e50', fontSize: 12 }}
            label={{
              value: 'Key User Jobs',
              position: 'insideBottom',
              offset: -50,
              style: { fill: '#2c3e50', fontWeight: 600 },
            }}
          />
          <YAxis
            domain={[-5, 5]}
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
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />

          {/* Highlight areas for advantage/disadvantage */}
          {highlightAreas.map((area, idx) => (
            <ReferenceArea
              key={idx}
              x1={area.startFeature}
              x2={area.endFeature}
              y1={-5}
              y2={5}
              fill={area.type === 'advantage' ? '#27ae60' : '#e74c3c'}
              fillOpacity={0.2}
              stroke={area.type === 'advantage' ? '#27ae60' : '#e74c3c'}
              strokeOpacity={0.3}
            />
          ))}

          {/* Render lines for each visible competitor */}
          {data.curves
            .filter((curve) => visibleCompetitors.has(curve.customer_profile))
            .map((curve, index) => (
              <Line
                key={curve.customer_profile}
                type="monotone"
                dataKey={curve.customer_profile}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ValueCurveChart;
