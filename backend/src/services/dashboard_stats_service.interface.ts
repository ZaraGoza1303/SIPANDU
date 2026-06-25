import type { DashboardStats } from "../dto/dashboard_stats.js";

export interface IDashboardStatsService {
    getStats(posyandu_id: string): Promise<DashboardStats>;
}
