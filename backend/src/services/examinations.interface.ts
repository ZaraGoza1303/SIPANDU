import type { CreateExamScheduleReq, CreatePatientExamReq, UpdatePatientExamReqSchema } from "../dto/patient.js";
import type { StuntingResult } from "../generated/prisma/client.js";

export interface IExaminationsService {
    addPatientExamination(newExamination: CreatePatientExamReq): Promise<StuntingResult>;
    addExamSchedule(posyandu_id: string, user_id: string, newSchedule: CreateExamScheduleReq): Promise<void>;
    updatePatientExamination(exam_id: string, newExamination: UpdatePatientExamReqSchema): Promise<StuntingResult>; 
}