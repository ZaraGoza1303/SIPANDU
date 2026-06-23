import type { PaginatedResponse } from "../dto/response.js";
import type { Patient } from "../generated/prisma/client.js"
import type { PatientCreateInput, PatientUpdateInput } from "../generated/prisma/models.js"

export interface IPatientRepository {
    getAll(posyandu_id: string, page: number, limit: number, search?: string | null): Promise<PaginatedResponse<Patient>>;
    getByID(posyandu_id: string, patient_id: string): Promise<Patient | null>;
    insertPatient(newPatient: PatientCreateInput): Promise<void>;
    updatePatient(posyandu_id: string, patient_id: string, newPatient: PatientUpdateInput): Promise<void>;
    deletePatient(posyandu_id: string, patient_id: string): Promise<void>;
}