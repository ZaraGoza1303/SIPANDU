import bcrypt from 'bcrypt';
import type { LoginReq, LoginUserData } from "../dto/auth.js";
import { PrismaClient } from "../generated/prisma/client.js";
import type { IAuthRepository } from "./auth_repository.interface.js";

export class AuthRepository implements IAuthRepository {
    private db: PrismaClient;

    constructor(db: PrismaClient) {
        this.db = db;
    }

    async login(req: LoginReq): Promise<LoginUserData> {
        const existsUser = await this.db.user.findFirst({
            where: {email: req.email},
            select: {
                id: true,
                email: true,
                role: true,
                password: true,
            }
        });

        if(!existsUser) {
            throw new Error("Wrong email or password!")
        }

        const isMatched = await bcrypt.compare(req.password, existsUser.password);
        if(!isMatched) {
            throw new Error("Wrong email or password!")
        }

        return existsUser;
    }
    
}