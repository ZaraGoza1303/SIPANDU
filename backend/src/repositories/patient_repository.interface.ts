import type { ExaminationWithPatient, PatientBirthAndGenderOnly, TodayPatientItem } from "../dto/patient.js";
import type { PaginatedResponse } from "../dto/response.js";
import type { Examination, Patient, Prisma, StuntingResult } from "../generated/prisma/client.js"
import type { ExaminationCreateInput, ExaminationUpdateInput, PatientCreateInput, PatientUpdateInput, ScheduleCreateInput, StuntingResultCreateInput, StuntingResultUpdateInput } from "../generated/prisma/models.js"

export interface IPatientsRepository {
    //base patient
    getAll(posyandu_id: string, page: number, limit: number, search?: string | null): Promise<PaginatedResponse<Patient>>;
    getByID(posyandu_id: string, patient_id: string): Promise<Patient | null>;
    insertPatient(newPatient: PatientCreateInput): Promise<void>;
    updatePatient(posyandu_id: string, patient_id: string, newPatient: PatientUpdateInput): Promise<void>;
    deletePatient(posyandu_id: string, patient_id: string): Promise<void>;

    getAllTodayPatients(posyandu_id: string, page: number, limit: number, today: Date, tomorrow: Date, search?: string | null): Promise<PaginatedResponse<TodayPatientItem>>
    getPatientBirthAndGenderOnly(patient_id: string): Promise<PatientBirthAndGenderOnly | null>;
}