import type { Prisma, StuntingResult } from "../generated/prisma/client.js";
import type { StuntingResultCreateInput, StuntingResultUpdateInput } from "../generated/prisma/models.js";

export interface IStuntingResultsRepository {
    insertStuntingResult(newStuntingResult: StuntingResultCreateInput, tx?: Prisma.TransactionClient): Promise<StuntingResult>;
    updateStuntingResult(exam_id: string, newStuntingResult: StuntingResultUpdateInput, tx?: Prisma.TransactionClient): Promise<StuntingResult>;
}