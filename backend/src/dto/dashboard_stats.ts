export interface AgeGroupCount {
  range: string;
  count: number;
}

export interface DashboardStats {
  totalPatients: number;
  totalExaminationsThisMonth: number;
  stuntingCount: number;
  normalCount: number;
  ageGroupDistribution: AgeGroupCount[];
}

export interface MonthlyTrendItem {
  month: string;
  total: number;
  stunting: number;
  percentage: number;
}

