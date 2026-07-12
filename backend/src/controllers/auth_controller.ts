import type { Request, Response } from "express";
import type { IAauthService } from "../services/auth_service.interface.js";
import { LoginSchema, UpdateProfileSchema } from "../dto/auth.js";
import { sendErrorResponse, sendSuccessfullResponse } from "../utils/response.js";
import { AppError } from "../utils/error.js";

export class AuthController {
    private authService: IAauthService

    constructor(authService: IAauthService) {
        this.authService = authService
    }

    async login(req: Request, res: Response) {
        try {
            if(!req.body){
                return res.status(400).json(sendErrorResponse("Request body empty"))
            };

            const validate = LoginSchema.safeParse(req.body);
            if(!validate.success){
                const formattedErr = validate.error.flatten().fieldErrors;
                return res.status(400).json(sendErrorResponse("Validation Failed", formattedErr))
            }

            const response = await this.authService.login(validate.data);
            return res.status(200).json(sendSuccessfullResponse("Login Berhasil", response))
        } catch (err: unknown) {
            return res.status(400).json(sendErrorResponse("Login Gagal", (err as Error).message))
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const user_id = req.user?.id;
            if (!user_id) {
                return res.status(401).json(sendErrorResponse("Unauthorized"));
            }

            if (!req.body) {
                return res.status(400).json(sendErrorResponse("Request body empty"))
            }

            const validate = UpdateProfileSchema.safeParse(req.body);
            if (!validate.success) {
                const formattedErr = validate.error.flatten().fieldErrors;
                return res.status(400).json(sendErrorResponse("Validation Failed", formattedErr))
            }

            await this.authService.updateProfile(user_id, validate.data);
            return res.status(200).json(sendSuccessfullResponse("Profile berhasil diupdate"))

        } catch (err: unknown) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal mengupdate profile", (err as Error).message))
        }
    }
}