import { Router } from "express";
import prisma from "../databases/prisma.js";
import { AuthRepository } from "../repositories/auth_repository.js";
import { AuthService } from "../services/auth_service.js";
import { AuthController } from "../controllers/auth_controller.js";
import { verifyJWTToken } from "../middleware/jwt.js";

const authRouter = Router();

const db = prisma;
const authRepo = new AuthRepository(db);
const authService = new AuthService(authRepo);
const authController = new AuthController(authService);

authRouter.post('/login', (req, res) => authController.login(req, res));
authRouter.post('/logout', (req, res) => authController.logout(req, res));
authRouter.patch('/profile', verifyJWTToken, (req, res) => authController.updateProfile(req, res));

export default authRouter;