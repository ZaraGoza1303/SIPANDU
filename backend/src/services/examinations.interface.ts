import type { ExaminationWithStunting, ScheduleWithUser, CreateExamScheduleReq, CreatePatientExamReq, UpdateExamScheduleReq, UpdatePatientExamReqSchema } from "../dto/patient.js";
import type { PaginatedResponse } from "../dto/response.js";
import type { StuntingResult } from "../generated/prisma/client.js";

export interface IExaminationsService {
    addPatientExamination(posyandu_id: string, user_id: string, newExamination: CreatePatientExamReq): Promise<StuntingResult>;
    addExamSchedule(posyandu_id: string, user_id: string, newSchedule: CreateExamScheduleReq): Promise<void>;
    updateExamSchedule(posyandu_id: string, exam_id: string, newSchedule: UpdateExamScheduleReq): Promise<void>;
    updatePatientExamination(posyandu_id: string, exam_id: string, newExamination: UpdatePatientExamReqSchema): Promise<StuntingResult>; 
    getAllExaminations(posyandu_id: string, page: number, limit: number, search?: string | null): Promise<PaginatedResponse<ExaminationWithStunting>>;
    getAllSchedules(posyandu_id: string, page: number, limit: number, search?: string | null, tanggal?: string | null): Promise<PaginatedResponse<ScheduleWithUser>>;
    markScheduleAsCompleted(posyandu_id: string, exam_id: string): Promise<void>;
    countTodayPendingExaminations(posyandu_id: string): Promise<{ total_patients: number; examined_count: number; pending_count: number }>;
    getExaminationsByPatient(posyandu_id: string, patient_id: string, page: number, limit: number): Promise<PaginatedResponse<ExaminationWithStunting>>;
}