import type { AgeGroupCount, MonthlyTrendItem } from "../dto/dashboard_stats.js";


export interface IDashboardStatsRepository {
  countAllPatients(posyandu_id: string): Promise<number>;
  countTotalExaminationsThisMonth(posyandu_id: string): Promise<number>;
  countActiveStunting(posyandu_id: string): Promise<number>;
  countNormalStatus(posyandu_id: string): Promise<number>;
  countByAgeGroup(posyandu_id: string): Promise<AgeGroupCount[]>;
  getMonthlyTrend(posyandu_id: string): Promise<MonthlyTrendItem[]>;
}
