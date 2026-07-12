import { Router } from "express";
import prisma from "../databases/prisma.js";
import { verifyJWTToken, authorizeRole } from "../middleware/jwt.js";
import { DashboardStatsRepository } from "../repositories/dashboard-stats_repository.js";
import { DashboardStatsService } from "../services/dashboard_stats_service.js";
import { DashboardController } from "../controllers/dashboard_controller.js";

const dashboardRouter = Router();

const db = prisma;
const dashboardRepo = new DashboardStatsRepository(db);
const dashboardService = new DashboardStatsService(dashboardRepo);
const dashboardController = new DashboardController(dashboardService);

dashboardRouter.use(verifyJWTToken);
dashboardRouter.get('/stats', authorizeRole('admin', 'bidan'), (req, res) => dashboardController.getStats(req, res));
dashboardRouter.get('/trend-stunting', authorizeRole('admin', 'bidan'), (req, res) => dashboardController.getMonthlyTrend(req, res));

export default dashboardRouter;
