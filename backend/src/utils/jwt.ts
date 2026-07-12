import jwt from 'jsonwebtoken';
import type { UserPayload } from "../types/express.js";

export const generateJWTToken = async (payload: UserPayload): Promise<string> =>{
    const token = jwt.sign(
        payload, 
        process.env.JWT_TOKEN!,
        {expiresIn: '3h'}
    )

    return token;
} 