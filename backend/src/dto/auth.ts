import z from "zod";

export const LoginSchema = z.object({
    email: z.string().email("email not valid"),
    password: z.string().min(1, 'password required'),
})

export const UpdateProfileSchema = z.object({
    name: z.string().min(1, "Nama wajib diisi").optional(),
    email: z.string().email("email not valid").optional(),
    phone: z.string().min(10, "No telpon minimal 10 digit").optional(),
    password: z.string().min(6, "Password minimal 6 karakter").optional(),
    old_password: z.string().min(1, "Password lama wajib diisi jika ingin mengganti password").optional(),
}).refine(
    (data) => {
        if (data.password && !data.old_password) return false;
        return true;
    },
    { message: "Password lama wajib diisi untuk mengganti password", path: ["old_password"] }
)

export type LoginRes = {
    jwt_token: string;
}

export type LoginUserData = {
    id: string;
    posyandu_id: string;
    email: string;
    role: string;
    password: string;
    photo: string | null;
}

export type LoginReq = z.infer<typeof LoginSchema>;
export type UpdateProfileReq = z.infer<typeof UpdateProfileSchema>;
 