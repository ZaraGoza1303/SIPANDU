declare global {
    namespace Express {
        interface Request {
            user?: UserPayload
        }
    }
}

export type UserPayload = {
    id: string,
    posyandu_id: string,
    email: string,
    role: string,
}