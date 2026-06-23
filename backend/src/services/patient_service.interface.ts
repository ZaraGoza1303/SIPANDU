import type { CreatePatientReq, UpdatePatientReq } from "../dto/patient.js";
import type { PaginatedResponse } from "../dto/response.js";
import type { Patient } from "../generated/prisma/client.js";

export interface IPatientService {
    getAll(posyandu_id: string, page: number, limit: number, search?: string | null): Promise<PaginatedResponse<Patient>>;
    getByID(posyandu_id: string, patient_id: string): Promise<Patient | null>;
    insertPatient(posyandu_id: string, newPatient: CreatePatientReq): Promise<void>;
    updatePatient(posyandu_id: string, patient_id: string, newPatient: UpdatePatientReq): Promise<void>;
    deletePatient(posyandu_id: string, patient_id: string): Promise<void>;

    checkPosyanduID(posyandu_id: string): void
}