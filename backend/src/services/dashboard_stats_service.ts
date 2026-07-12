import type { IDashboardStatsService } from "./dashboard_stats_service.interface.js";
import type {  IDashboardStatsRepository } from "../repositories/dashboard-stats.interface.js";
import type { DashboardStats, MonthlyTrendItem, Periode } from "../dto/dashboard_stats.js";

export class DashboardStatsService implements IDashboardStatsService {
    private dashboardRepo: IDashboardStatsRepository;

    constructor(dashboardRepo: IDashboardStatsRepository) {
        this.dashboardRepo = dashboardRepo;
    }

    async getStats(posyandu_id: string, periode: Periode): Promise<DashboardStats> {
        const [
            totalPatients,
            totalExaminations,
            stuntingCount,
            normalCount,
            ageGroupDistribution,
        ] = await Promise.all([
            this.dashboardRepo.countAllPatients(posyandu_id),
            this.dashboardRepo.countTotalExaminations(posyandu_id, periode),
            this.dashboardRepo.countActiveStunting(posyandu_id),
            this.dashboardRepo.countNormalStatus(posyandu_id),
            this.dashboardRepo.countByAgeGroup(posyandu_id),
        ]);

        return {
            totalPatients,
            totalExaminations,
            stuntingCount,
            normalCount,
            ageGroupDistribution,
        };
    }

    async getMonthlyTrend(posyandu_id: string, periode?: Periode): Promise<MonthlyTrendItem[]> {
        return await this.dashboardRepo.getMonthlyTrend(posyandu_id, periode);
    }
}