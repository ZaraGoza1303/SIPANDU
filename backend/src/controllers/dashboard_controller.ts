import type { Request, Response } from "express";
import { sendErrorResponse, sendSuccessfullResponse } from "../utils/response.js";
import { AppError } from "../utils/error.js";
import type { IDashboardStatsService } from "../services/dashboard_stats_service.interface.js";
import type { Periode } from "../dto/dashboard_stats.js";

export class DashboardController {
    private dashboardService: IDashboardStatsService;

    constructor(dashboardService: IDashboardStatsService) {
        this.dashboardService = dashboardService;
    }

    async getStats(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;

            if (!posyandu_id) {
                return res.status(400).json(sendErrorResponse("posyandu_id tidak ditemukan"));
            }

            const periode = (req.query.periode as Periode) || 'bulan_ini';

            if (periode !== 'bulan_ini' && periode !== 'bulan_lalu') {
                return res.status(400).json(sendErrorResponse("Periode tidak valid. Gunakan 'bulan_ini' atau 'bulan_lalu'"));
            }

            const stats = await this.dashboardService.getStats(posyandu_id, periode);
            return res.status(200).json(sendSuccessfullResponse("Berhasil mengambil data dashboard", stats));

        } catch (err: unknown) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message));
            }

            return res.status(500).json(sendErrorResponse("Gagal mengambil data dashboard", (err as Error).message));
        }
    }

    async getMonthlyTrend(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;

            if (!posyandu_id) {
                return res.status(400).json(sendErrorResponse("posyandu_id tidak ditemukan"));
            }

            const periode = req.query.periode as Periode | undefined;

            if (periode && periode !== 'bulan_ini' && periode !== 'bulan_lalu') {
                return res.status(400).json(sendErrorResponse("Periode tidak valid. Gunakan 'bulan_ini' atau 'bulan_lalu'"));
            }

            const trend = await this.dashboardService.getMonthlyTrend(posyandu_id, periode);
            return res.status(200).json(sendSuccessfullResponse("Berhasil mengambil data trend stunting", trend));

        } catch (err: unknown) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message));
            }

            return res.status(500).json(sendErrorResponse("Gagal mengambil data trend stunting", (err as Error).message));
        }
    }
}