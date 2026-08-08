import type { LoginReq, LoginRes, UpdateProfileReq } from "../dto/auth.js";
import type { IAuthRepository } from "../repositories/auth_repository.interface.js";
import { generateJWTToken } from "../utils/jwt.js";
import type { IAauthService } from "./auth_service.interface.js";
import bcrypt from 'bcrypt';
import { AppError } from "../utils/error.js";

export class AuthService implements IAauthService {
    private authRepo: IAuthRepository

    constructor(authRepo: IAuthRepository) {
        this.authRepo = authRepo
    }

    async login(req: LoginReq): Promise<LoginRes> {
        const existsUser = await this.authRepo.login(req);

        if(!existsUser) {
            throw new Error("Wrong email or password!")
        }
        
        const isMatched = await bcrypt.compare(req.password, existsUser.password);
        if(!isMatched) {
            throw new Error("Wrong email or password!")
        }

        const jwtToken = await generateJWTToken({ id: existsUser?.id, email: existsUser.email, role: existsUser.role, posyandu_id: existsUser.posyandu_id });
        const res: LoginRes = {
            jwt_token: jwtToken
        }

        return res
    }

    async updateProfile(user_id: string, req: UpdateProfileReq): Promise<void> {
        const userData = await this.authRepo.findByID(user_id);

        if (!userData) {
            throw new AppError("User tidak ditemukan", 404);
        }

        const updateData: Record<string, string> = {};

        if (req.name !== undefined) updateData.name = req.name;
        if (req.email !== undefined) updateData.email = req.email;
        if (req.phone !== undefined) updateData.phone = req.phone;

        if (req.password && req.old_password) {
            const isOldPasswordValid = await bcrypt.compare(req.old_password, userData.password);
            if (!isOldPasswordValid) {
                throw new AppError("Password lama salah", 400);
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(req.password, salt);
        }

        await this.authRepo.updateProfile(user_id, updateData);
    }
    
}