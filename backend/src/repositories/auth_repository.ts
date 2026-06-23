import type { LoginReq, LoginUserData } from "../dto/auth.js";
import { PrismaClient } from "../generated/prisma/client.js";
import type { IAuthRepository } from "./auth_repository.interface.js";

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
                email: true,
                role: true,
                password: true,
            }
        });

        return existsUser;
    }

    
}