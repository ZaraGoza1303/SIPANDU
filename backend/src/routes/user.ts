import { Router } from "express";
import multer from "multer";
import prisma from "../databases/prisma.js";
import { UserRepository } from "../repositories/user_repository.js";
import { UserService } from "../services/user_service.js";
import { UserController } from "../controllers/user_controller.js";
import { verifyJWTToken } from "../middleware/jwt.js";
import { Supabase } from "../services/supabase.js";

const userRouter = Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

const db = prisma;
const supabase = new Supabase();
const userRepo = new UserRepository(db);
const userService = new UserService(userRepo, supabase);
const userController = new UserController(userService);

userRouter.use(verifyJWTToken);
userRouter.get('/me', (req, res) => userController.getProfile(req, res));
userRouter.patch('/me', upload.single('photo'), (req, res) => userController.updateProfile(req, res));

export default userRouter;