import type { AgeGroupCount, MonthlyTrendItem, Periode } from "../dto/dashboard_stats.js";

export interface IDashboardStatsRepository {
  countAllPatients(posyandu_id: string): Promise<number>;
  countTotalExaminations(posyandu_id: string, periode: Periode): Promise<number>;
  countActiveStunting(posyandu_id: string): Promise<number>;
  countNormalStatus(posyandu_id: string): Promise<number>;
  countByAgeGroup(posyandu_id: string): Promise<AgeGroupCount[]>;
  getMonthlyTrend(posyandu_id: string, periode?: Periode): Promise<MonthlyTrendItem[]>;
}
