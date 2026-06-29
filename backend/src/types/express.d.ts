declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string, 
                posyandu_id: string,
                email: string,
                role: string,
            }
        }
    }
}

export {}