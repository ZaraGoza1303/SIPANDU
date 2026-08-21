import type { LoginReq, LoginUserData } from "../dto/auth.js";
import { PrismaClient } from "../generated/prisma/client.js";
import type { Prisma } from "../generated/prisma/client.js";
import type { IAuthRepository } from "./auth_repository.interface.js";
import { AppError } from "../utils/error.js";

export class AuthRepository implements IAuthRepository {
    private db: PrismaClient;

    constructor(db: PrismaClient) {
        this.db = db;
    }

    async login(req: LoginReq): Promise<LoginUserData | null> {
        const existsUser = await this.db.user.findFirst({
            where: {email: req.email},
            select: {
                id: true,
                posyandu_id: true,
                email: true,
                role: true,
                password: true,
                photo: true,
            }
        });

        return existsUser;
    }

    async findByID(user_id: string): Promise<LoginUserData | null> {
        const user = await this.db.user.findFirst({
            where: { id: user_id },
            select: {
                id: true,
                posyandu_id: true,
                email: true,
                role: true,
                password: true,
                photo: true,
            }
        })

        return user;
    }

    async updateProfile(user_id: string, data: Prisma.UserUpdateInput): Promise<void> {
        const result = await this.db.user.updateMany({
            where: { id: user_id },
            data,
        })

        if (result.count === 0) {
            throw new AppError("User tidak ditemukan", 404);
        }
    }
    
}