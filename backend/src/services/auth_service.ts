import type { LoginReq, LoginRes } from "../dto/auth.js";
import type { IAuthRepository } from "../repositories/auth_repository.interface.js";
import { generateJWTToken } from "../utils/jwt.js";
import type { IAauthService } from "./auth_service.interface.js";
import bcrypt from 'bcrypt';

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
    
}