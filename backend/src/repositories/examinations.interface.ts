import type { ExaminationWithPatient, ExaminationWithStunting, ScheduleWithUser } from "../dto/patient.js";
import type { PaginatedResponse } from "../dto/response.js";
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
    getAllExaminations(posyandu_id: string, page: number, limit: number, search?: string | null): Promise<PaginatedResponse<ExaminationWithStunting>>
    getAllSchedules(posyandu_id: string, page: number, limit: number, search?: string | null, tanggal?: string | null): Promise<PaginatedResponse<ScheduleWithUser>>
    countTodayPendingExaminations(posyandu_id: string, today: Date, tomorrow: Date): Promise<{ total_patients: number; examined_count: number; pending_count: number }>;
    getExaminationsByPatient(posyandu_id: string, patient_id: string, page: number, limit: number): Promise<PaginatedResponse<ExaminationWithStunting>>;
}