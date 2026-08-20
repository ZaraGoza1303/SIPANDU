import type { Request, Response } from "express";
import type { IUserService } from "../services/user_service.js";
import { UpdateProfileSchema } from "../dto/auth.js";
import { sendErrorResponse, sendSuccessfullResponse } from "../utils/response.js";
import { AppError } from "../utils/error.js";

export class UserController {
    private userService: IUserService;

    constructor(userService: IUserService) {
        this.userService = userService;
    }

    async getProfile(req: Request, res: Response) {
        try {
            const user_id = req.user?.id;
            if (!user_id) {
                return res.status(401).json(sendErrorResponse("Unauthorized"));
            }

            const profile = await this.userService.getProfile(user_id);
            return res.status(200).json(sendSuccessfullResponse("Profile berhasil didapatkan", profile));
        } catch (err: unknown) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json(sendErrorResponse(err.message));
            }
            return res.status(500).json(sendErrorResponse("Gagal mendapatkan profile", (err as Error).message));
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const user_id = req.user?.id;
            if (!user_id) {
                return res.status(401).json(sendErrorResponse("Unauthorized"));
            }

            // Parse JSON fields from multipart form data
            const body = req.body;
            const validate = UpdateProfileSchema.safeParse({
                name: body.name,
                email: body.email,
                phone: body.phone,
                password: body.password,
                old_password: body.old_password,
            });

            if (!validate.success) {
                const formattedErr = validate.error.flatten().fieldErrors;
                return res.status(400).json(sendErrorResponse("Validation Failed", formattedErr));
            }

            const profile = await this.userService.updateProfile(user_id, validate.data, req.file);
            return res.status(200).json(sendSuccessfullResponse("Profile berhasil diupdate", profile));
        } catch (err: unknown) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json(sendErrorResponse(err.message));
            }
            return res.status(500).json(sendErrorResponse("Gagal mengupdate profile", (err as Error).message));
        }
    }
}