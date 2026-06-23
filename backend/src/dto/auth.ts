import z from "zod";

export const LoginSchema = z.object({
    email: z.string().email("email not valid"),
    password: z.string().min(1, 'password required'),
})

export type LoginRes = {
    jwt_token: string;
}

export type LoginUserData = {
    id: string;
    posyandu_id: string;
    email: string;
    role: string;
    password: string;
}

export type LoginReq = z.infer<typeof LoginSchema>;
 