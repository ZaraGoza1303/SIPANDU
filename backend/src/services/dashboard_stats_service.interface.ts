import type { DashboardStats, MonthlyTrendItem, Periode } from "../dto/dashboard_stats.js";

export interface IDashboardStatsService {
    getStats(posyandu_id: string, periode: Periode): Promise<DashboardStats>;
    getMonthlyTrend(posyandu_id: string, periode?: Periode): Promise<MonthlyTrendItem[]>;
}
