import type { CreateExamScheduleReq, CreatePatientExamReq, UpdateExamScheduleReq, UpdatePatientExamReqSchema } from "../dto/patient.js";
import type { StuntingResult } from "../generated/prisma/client.js";

export interface IExaminationsService {
    addPatientExamination(posyandu_id: string, newExamination: CreatePatientExamReq): Promise<StuntingResult>;
    addExamSchedule(posyandu_id: string, user_id: string, newSchedule: CreateExamScheduleReq): Promise<void>;
    updateExamSchedule(posyandu_id: string, exam_id: string, newSchedule: UpdateExamScheduleReq): Promise<void>;
    updatePatientExamination(posyandu_id: string, exam_id: string, newExamination: UpdatePatientExamReqSchema): Promise<StuntingResult>; 
}