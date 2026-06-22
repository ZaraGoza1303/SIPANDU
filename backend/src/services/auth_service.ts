import type { LoginReq, LoginRes } from "../dto/auth.js";
import type { IAuthRepository } from "../repositories/auth_repository.interface.js";
import { generateJWTToken } from "../utils/jwt.js";
import type { IAauthService } from "./auth_service.interface.js";

export class AuthService implements IAauthService {
    private authRepo: IAuthRepository

    constructor(authRepo: IAuthRepository) {
        this.authRepo = authRepo
    }

    async login(req: LoginReq): Promise<LoginRes> {
        const existsUser = await this.authRepo.login(req);

        const jwtToken = await generateJWTToken({ id: existsUser?.id, email: existsUser.email });
        const res: LoginRes = {
            jwt_token: jwtToken
        }

        return res
    }
    
}