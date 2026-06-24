import type { ExaminationWithPatient, PatientBirthAndGenderOnly, TodayPatientItem } from "../dto/patient.js";
import type { PaginatedResponse } from "../dto/response.js";
import type { Examination, Patient, Prisma, StuntingResult } from "../generated/prisma/client.js"
import type { ExaminationCreateInput, ExaminationUpdateInput, PatientCreateInput, PatientUpdateInput, StuntingResultCreateInput, StuntingResultUpdateInput } from "../generated/prisma/models.js"

export interface IPatientRepository {
    getAll(posyandu_id: string, page: number, limit: number, search?: string | null): Promise<PaginatedResponse<Patient>>;
    getByID(posyandu_id: string, patient_id: string): Promise<Patient | null>;
    insertPatient(newPatient: PatientCreateInput): Promise<void>;
    updatePatient(posyandu_id: string, patient_id: string, newPatient: PatientUpdateInput): Promise<void>;
    deletePatient(posyandu_id: string, patient_id: string): Promise<void>;

    getAllTodayPatients(posyandu_id: string, page: number, limit: number, today: Date, tomorrow: Date, search?: string | null): Promise<PaginatedResponse<TodayPatientItem>>
    getPatientBirthAndGenderOnly(patient_id: string): Promise<PatientBirthAndGenderOnly | null>;
    
    //examinations and stunting results
    getExamByID(exam_id: string): Promise<ExaminationWithPatient | null>;
    insertExamination(newExam: ExaminationCreateInput, tx?: Prisma.TransactionClient): Promise<Examination>;
    insertStuntingResult(newStuntingResult: StuntingResultCreateInput, tx?: Prisma.TransactionClient): Promise<StuntingResult>;
    updateExamination(exam_id: string, newExamination: ExaminationUpdateInput, tx?: Prisma.TransactionClient): Promise<void>;
    updateStuntingResult(exam_id: string, newStuntingResult: StuntingResultUpdateInput, tx?: Prisma.TransactionClient): Promise<StuntingResult>;
    checkScheduleExam(posyandu_id: string, today: Date, tomorrow: Date): Promise<Boolean>

    
}