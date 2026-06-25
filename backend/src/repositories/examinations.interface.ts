import type { ExaminationWithPatient } from "../dto/patient.js";
import type { Examination, Prisma } from "../generated/prisma/client.js";
import type { ExaminationCreateInput, ExaminationUpdateInput, ScheduleCreateInput } from "../generated/prisma/models.js";

export interface IExaminationsRepository {
    getExamByID(exam_id: string): Promise<ExaminationWithPatient | null>;
    insertExamination(newExam: ExaminationCreateInput, tx?: Prisma.TransactionClient): Promise<Examination>;
    insertExamSchedule(newSchedule: ScheduleCreateInput): Promise<void>;
    updateExamination(exam_id: string, newExamination: ExaminationUpdateInput, tx?: Prisma.TransactionClient): Promise<void>;
    checkScheduleExam(posyandu_id: string, today: Date, tomorrow: Date): Promise<Boolean>
}