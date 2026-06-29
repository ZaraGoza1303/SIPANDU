import type { Prisma, PrismaClient, StuntingResult } from "../generated/prisma/client.js";
import type { StuntingResultCreateInput, StuntingResultUpdateInput } from "../generated/prisma/models.js";
import type { IStuntingResultsRepository } from "./stunting-results.interface.js";

export class StuntingResultsRepository implements IStuntingResultsRepository {
    private db: PrismaClient;

    constructor(db: PrismaClient) {
        this.db = db;
    }

    async insertStuntingResult(newStuntingResult: StuntingResultCreateInput, tx?: Prisma.TransactionClient): Promise<StuntingResult> {
        const client = tx || this.db
        const result = await client.stuntingResult.create({
            data: newStuntingResult
        })

        return result;
    }

    async updateStuntingResult(exam_id: string, newStuntingResult: StuntingResultUpdateInput, tx?: Prisma.TransactionClient): Promise<StuntingResult> {
        const client = tx || this.db

        const result = await client.stuntingResult.update({
            where: {
                id: exam_id,
            },

            data: newStuntingResult
        })

        return result
    }
}