// Type definitions for Value Curve data structure

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

export type HighlightMode = 'none' | 'advantage' | 'disadvantage';

export interface ChartDataPoint {
  feature: string;
  [key: string]: string | number; // Dynamic keys for each competitor
}
