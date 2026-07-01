import type { ExaminationWithPatient } from "../dto/patient.js";
import type { Examination, Prisma, Schedule } from "../generated/prisma/client.js";
import type { ExaminationCreateInput, ExaminationUpdateInput, ScheduleCreateInput, ScheduleUpdateInput } from "../generated/prisma/models.js";

export interface IExaminationsRepository {
    getExamByID(posyandu_id: string, exam_id: string): Promise<ExaminationWithPatient | null>;
    getExamScheduleByID(posyandu_id: string, exam_id: string): Promise<Schedule | null>;
    insertExamination(newExam: ExaminationCreateInput, tx?: Prisma.TransactionClient): Promise<Examination>;
    insertExamSchedule(newSchedule: ScheduleCreateInput): Promise<void>;
    updateExamSchedule(posyandu_id: string, exam_id: string, newSchedule: ScheduleUpdateInput): Promise<void>;
    updateExamination(posyandu_id: string, exam_id: string, newExamination: ExaminationUpdateInput, tx?: Prisma.TransactionClient): Promise<void>;
    checkScheduleExam(posyandu_id: string, today: Date, tomorrow: Date): Promise<Boolean>
    deleteExamSchedule(posyandu_id: string, exam_id: string): Promise<void>;
}