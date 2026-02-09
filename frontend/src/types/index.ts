// Type definitions for Value Curve data structure

export interface LineStyle {
  color: string;
  strokeDasharray?: string;
  strokeWidth: number;
}

export interface ValueCurve {
  customer_profile: string;
  relative_customer_value: number[];
}

export interface UserJob {
  name: string;
  description: string;
}

export interface ValueCurveData {
  industry: string;
  features: string[];
  curves: ValueCurve[];
  user_jobs?: UserJob[];
  user_persona?: string;
}

// Admin UI extended types
export type CompetitorRationale = Record<string, string>; // feature name -> rationale text

export interface AdminMetadata {
  created_at?: string;
  updated_at?: string;
}

export interface ValueCurveDataExtended extends ValueCurveData {
  rationale?: Record<string, CompetitorRationale>; // competitor name -> { feature -> rationale }
  admin_metadata?: AdminMetadata;
}

export interface ProjectSummary {
  name: string;
  industry: string;
  feature_count: number;
  competitor_count: number;
}

export type HighlightMode = 'none' | 'advantage' | 'disadvantage';

export interface ChartDataPoint {
  feature: string;
  [key: string]: string | number; // Dynamic keys for each competitor
}

// Shared line style configuration
export const OUR_SOLUTION_STYLE: LineStyle = {
  color: '#22c55e',
  strokeDasharray: undefined,
  strokeWidth: 4,
};

const COMPETITOR_COLORS = [
  '#8484E6', // Purple
  '#E8A87C', // Orange
  '#6B9BD1', // Blue
  '#D4A5D4', // Lavender
  '#9297A8', // Slate
  '#C75D5D', // Muted red
  '#5DB8B0', // Teal
  '#B8A94D', // Gold
];

const DASH_PATTERNS = [
  '8 4',
  '4 4',
  '2 4',
  '12 4 4 4',
  '8 4 2 4 2 4',
  '16 4',
  '4 2',
  '12 4 2 4',
];

export function isOurSolution(name: string): boolean {
  return name.includes('Our Solution') || name.includes('Blue Ocean');
}

export function buildStyleMap(curves: ValueCurve[]): Map<string, LineStyle> {
  const map = new Map<string, LineStyle>();
  let competitorIndex = 0;
  curves.forEach((curve) => {
    if (isOurSolution(curve.customer_profile)) {
      map.set(curve.customer_profile, OUR_SOLUTION_STYLE);
    } else {
      map.set(curve.customer_profile, {
        color: COMPETITOR_COLORS[competitorIndex % COMPETITOR_COLORS.length],
        strokeDasharray: DASH_PATTERNS[competitorIndex % DASH_PATTERNS.length],
        strokeWidth: 2.5,
      });
      competitorIndex++;
    }
  });
  return map;
}
