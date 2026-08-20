import { AuthRepository } from "./auth_repository.js";
import { PrismaClient } from "../generated/prisma/client.js";
import type { IUserRepository } from "./user_repository.interface.js";

export class UserRepository extends AuthRepository implements IUserRepository {
    constructor(db: PrismaClient) {
        super(db);
    }
}