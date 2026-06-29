import type { DashboardStats, MonthlyTrendItem } from "../dto/dashboard_stats.js";

export interface IDashboardStatsService {
    getStats(posyandu_id: string): Promise<DashboardStats>;
    getMonthlyTrend(posyandu_id: string): Promise<MonthlyTrendItem[]>;
}
