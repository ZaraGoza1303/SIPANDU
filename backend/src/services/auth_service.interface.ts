import type { LoginReq, LoginRes, UpdateProfileReq } from "../dto/auth.js";

export interface IAauthService {
    login(req: LoginReq): Promise<LoginRes>;
    updateProfile(user_id: string, req: UpdateProfileReq): Promise<void>;
}