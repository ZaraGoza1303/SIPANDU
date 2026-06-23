import type { CreatePatientReq, UpdatePatientReq } from "../dto/patient.js";
import type { PaginatedResponse } from "../dto/response.js";
import type { Patient } from "../generated/prisma/client.js";
import type { PatientCreateInput, PatientUpdateInput } from "../generated/prisma/models.js";
import type { IPatientRepository } from "../repositories/patient_repository.interface.js";
import { AppError, handlePrismaError } from "../utils/error.js";
import type { IPatientService } from "./patient_service.interface.js";

export class PatientService implements IPatientService {
    private patientRepo: IPatientRepository

    constructor(patientRepo: IPatientRepository) {
        this.patientRepo = patientRepo
    }

    checkPosyanduID(posyandu_id: string): void {
        if(!posyandu_id) {
            throw new AppError("Forbidden", 403)
        }
    }

    async getAll(posyandu_id: string, page: number, limit: number, search?: string | null): Promise<PaginatedResponse<Patient>> {
        this.checkPosyanduID(posyandu_id);

        const patients = await this.patientRepo.getAll(posyandu_id, page, limit, search)
        return patients;
    }

    async getByID(posyandu_id: string, patient_id: string): Promise<Patient | null> {
        this.checkPosyanduID(posyandu_id);

        const existsPatient = await this.patientRepo.getByID(posyandu_id, patient_id);
        return existsPatient
    }

    async insertPatient(posyandu_id: string, newPatient: CreatePatientReq): Promise<void> {
        this.checkPosyanduID(posyandu_id);

        try {
            const newPatientReq: PatientCreateInput = {
                posyandu: {
                    connect: {id: posyandu_id}
                },
                nik: newPatient.nik,
                picture: newPatient.picture,
                nik_parent: newPatient.nik_parent,
                name: newPatient.name,
                birth_date: new Date(newPatient.birth_date),
                gender: newPatient.gender,
                mother_name: newPatient.mother_name,
                father_name: newPatient.father_name,
                address: newPatient.address,
                phone_parent: newPatient.phone_parent,
            }

            await this.patientRepo.insertPatient(newPatientReq)
        } catch (err) {
            handlePrismaError(err)
        }
    }

    async updatePatient(posyandu_id: string, patient_id: string, newPatient: UpdatePatientReq): Promise<void> {
        this.checkPosyanduID(posyandu_id);
        
        try {

            const updateData: PatientUpdateInput = {};

            if (newPatient.name !== undefined) updateData.name = newPatient.name;
            if (newPatient.nik !== undefined) updateData.nik = newPatient.nik;
            if (newPatient.picture !== undefined) updateData.picture = newPatient.picture;
            if (newPatient.nik_parent !== undefined) updateData.nik_parent = newPatient.nik_parent;
            if (newPatient.gender !== undefined) updateData.gender = newPatient.gender;
            if (newPatient.mother_name !== undefined) updateData.mother_name = newPatient.mother_name;
            if (newPatient.father_name !== undefined) updateData.father_name = newPatient.father_name;
            if (newPatient.address !== undefined) updateData.address = newPatient.address;
            if (newPatient.phone_parent !== undefined) updateData.phone_parent = newPatient.phone_parent;

            if (newPatient.birth_date !== undefined) {
                updateData.birth_date = new Date(newPatient.birth_date);
            }

            await this.patientRepo.updatePatient(posyandu_id, patient_id, updateData);
        } catch(err) {
            handlePrismaError(err)
        }
    }

    async deletePatient(posyandu_id: string, patient_id: string): Promise<void> {
        this.checkPosyanduID(posyandu_id);

        try {
            await this.patientRepo.deletePatient(posyandu_id, patient_id)
        } catch(err) {
            handlePrismaError(err)
        }
    }
}