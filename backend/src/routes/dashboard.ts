import { Router } from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import { verifyJWTToken } from "../middleware/jwt.js";
import { DashboardStatsRepository } from "../repositories/dashboard-stats_repository.js";
import { DashboardStatsService } from "../services/dashboard_stats_service.js";
import { DashboardController } from "../controllers/dashboard_controller.js";

const dashboardRouter = Router();

const db = new PrismaClient();
const dashboardRepo = new DashboardStatsRepository(db);
const dashboardService = new DashboardStatsService(dashboardRepo);
const dashboardController = new DashboardController(dashboardService);

dashboardRouter.use(verifyJWTToken);
dashboardRouter.get('/stats', (req, res) => dashboardController.getStats(req, res));
dashboardRouter.get('/trend-stunting', (req, res) => dashboardController.getMonthlyTrend(req, res));

export default dashboardRouter;
