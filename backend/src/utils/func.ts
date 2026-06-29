import { AppError } from "./error.js";

export function checkPosyanduID(posyandu_id: string): void {
    if(!posyandu_id) {
        throw new AppError("Not Found", 404)
    }
}