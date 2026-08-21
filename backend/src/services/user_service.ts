import type { UpdateProfileReq } from "../dto/auth.js";
import type { IUserRepository } from "../repositories/user_repository.interface.js";
import { AppError } from "../utils/error.js";
import bcrypt from 'bcrypt';
import { Supabase } from "./supabase.js";

export interface IUserService {
    getProfile(user_id: string): Promise<UserProfile>;
    updateProfile(user_id: string, req: UpdateProfileReq, photoFile?: Express.Multer.File): Promise<UserProfile>;
}

export type UserProfile = {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    posyandu_id: string;
    photo: string | null;
    created_at: Date;
};

export class UserService implements IUserService {
    private userRepo: IUserRepository;
    private supabase: Supabase;

    constructor(userRepo: IUserRepository, supabase: Supabase) {
        this.userRepo = userRepo;
        this.supabase = supabase;
    }

    async getProfile(user_id: string): Promise<UserProfile> {
        const user = await this.userRepo.findByID(user_id);
        if (!user) throw new AppError("User tidak ditemukan", 404);
        return this.toUserProfile(user);
    }

    async updateProfile(user_id: string, req: UpdateProfileReq, photoFile?: Express.Multer.File): Promise<UserProfile> {
        const userData = await this.userRepo.findByID(user_id);
        if (!userData) throw new AppError("User tidak ditemukan", 404);

        const updateData: Record<string, string> = {};

        if (req.name !== undefined) updateData.name = req.name;
        if (req.email !== undefined) updateData.email = req.email;
        if (req.phone !== undefined) updateData.phone = req.phone;

        if (req.password && req.old_password) {
            const isOldPasswordValid = await bcrypt.compare(req.old_password, userData.password);
            if (!isOldPasswordValid) throw new AppError("Password lama salah", 400);
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(req.password, salt);
        }

        if (photoFile) {
            const fileExtension = photoFile.originalname.split('.').pop() || 'jpg';
            const fileBuffer = photoFile.buffer;
            const photoUrl = await this.supabase.uploadFile(fileBuffer, photoFile.mimetype, fileExtension, `users/${user_id}/${Date.now()}.${fileExtension}`);
            updateData.photo = photoUrl;
        }

        await this.userRepo.updateProfile(user_id, updateData);
        const updatedUser = await this.userRepo.findByID(user_id);
        return this.toUserProfile(updatedUser!);
    }

    private toUserProfile(user: any): UserProfile {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            posyandu_id: user.posyandu_id,
            photo: user.photo,
            created_at: user.created_at,
        };
    }
}