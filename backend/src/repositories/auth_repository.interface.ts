import type { LoginReq, LoginUserData, UpdateProfileReq } from "../dto/auth.js";
import type { Prisma } from "../generated/prisma/client.js";

export interface IAuthRepository {
    login(req: LoginReq): Promise<LoginUserData | null>;
    findByID(user_id: string): Promise<LoginUserData | null>;
    updateProfile(user_id: string, data: Prisma.UserUpdateInput): Promise<void>;
}