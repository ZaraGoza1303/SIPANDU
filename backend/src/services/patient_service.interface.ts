import type { CreateExamScheduleReq, CreatePatientExamReq, CreatePatientReq, TodayPatientItem, UpdatePatientExamReqSchema, UpdatePatientReq } from "../dto/patient.js";
import type { PaginatedResponse } from "../dto/response.js";
import type { Patient, StuntingResult } from "../generated/prisma/client.js";

export interface IPatientService {
    //base patient
    getAll(posyandu_id: string, page: number, limit: number, search?: string | null): Promise<PaginatedResponse<Patient>>;
    getByID(posyandu_id: string, patient_id: string): Promise<Patient | null>;
    insertPatient(posyandu_id: string, newPatient: CreatePatientReq): Promise<void>;
    updatePatient(posyandu_id: string, patient_id: string, newPatient: UpdatePatientReq): Promise<void>;
    deletePatient(posyandu_id: string, patient_id: string): Promise<void>;

    //examination
    addPatientExamination(newExamination: CreatePatientExamReq): Promise<StuntingResult>;
    addExamSchedule(posyandu_id: string, user_id: string, newSchedule: CreateExamScheduleReq): Promise<void>;
    updatePatientExamination(exam_id: string, newExamination: UpdatePatientExamReqSchema): Promise<StuntingResult>;

    checkPosyanduID(posyandu_id: string): void
    getAllTodayPatients(posyandu_id: string, page: number, limit: number, search?: string | null): Promise<PaginatedResponse<TodayPatientItem>>
    
}