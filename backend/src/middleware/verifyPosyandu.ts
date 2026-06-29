import type { Request, Response, NextFunction } from "express"
import { sendErrorResponse } from "../utils/response.js";

export const verifyPosyanduAccess = (req: Request, res: Response, next: NextFunction) => {
    const posyandu_id = req.user?.posyandu_id;
    if (!posyandu_id) {
        return res.status(403).json(sendErrorResponse("Forbidden"));
    }
    next();
}
