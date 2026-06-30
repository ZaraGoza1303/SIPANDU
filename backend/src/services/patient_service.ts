import type { CreatePatientReq, TodayPatientItem, UpdatePatientReq } from "../dto/patient.js";
import type { PaginatedResponse } from "../dto/response.js";
import type { Patient } from "../generated/prisma/client.js";
import type { PatientCreateInput, PatientUpdateInput, ScheduleCreateInput, StuntingResultCreateInput, StuntingResultUpdateInput } from "../generated/prisma/models.js";
import type { IExaminationsRepository } from "../repositories/examinations.interface.js";
import type { IPatientsRepository } from "../repositories/patient_repository.interface.js";
import { AppError, handlePrismaError } from "../utils/error.js";
import { checkPosyanduID } from "../utils/func.js";
import type { IPatientService } from "./patient_service.interface.js";

export class PatientService implements IPatientService {
    private patientRepo: IPatientsRepository;
    private examinationsRepo: IExaminationsRepository;

    constructor(
        patientRepo: IPatientsRepository,
        examinationsRepo: IExaminationsRepository,
    ) {
        this.patientRepo = patientRepo;
        this.examinationsRepo = examinationsRepo;
    }

    async getAllTodayPatients(posyandu_id: string, page: number, limit: number, search?: string | null): Promise<PaginatedResponse<TodayPatientItem>> {
        checkPosyanduID(posyandu_id);

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tomorrow = new Date();
            tomorrow.setHours(23, 59, 59, 999);
            
            const isScheduleExists = await this.examinationsRepo.checkScheduleExam(posyandu_id, today, tomorrow);
            if (!isScheduleExists){
                return { 
                    items: [],
                    next_cursor: null,
                    meta: {
                        total_items: 0,
                        current_page: 0,
                        limit: 0,
                        total_pages: 0,
                    }
                }
            }

            const todayPatients = await this.patientRepo.getAllTodayPatients(posyandu_id, page, limit, today, tomorrow, search);
            return todayPatients;
        } catch(err){
            handlePrismaError(err)
        }
    }

    async getAll(posyandu_id: string, page: number, limit: number, search?: string | null): Promise<PaginatedResponse<Patient>> {
        checkPosyanduID(posyandu_id);

        const patients = await this.patientRepo.getAll(posyandu_id, page, limit, search)
        return patients;
    }

    async getByID(posyandu_id: string, patient_id: string): Promise<Patient | null> {
        checkPosyanduID(posyandu_id);

        const existsPatient = await this.patientRepo.getByID(posyandu_id, patient_id);
        return existsPatient
    }

    async insertPatient(posyandu_id: string, newPatient: CreatePatientReq): Promise<void> {
        checkPosyanduID(posyandu_id);

        try {
            const newPatientReq: PatientCreateInput = {
                posyandu: {
                    connect: {id: posyandu_id}
                },
                nik: newPatient.nik,
                picture: newPatient.picture ?? null,
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
        try {
            const existsPatient = await this.patientRepo.getByID(posyandu_id, patient_id);
            if (!existsPatient) throw new AppError("Patient not found", 404);
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
        checkPosyanduID(posyandu_id);

        try {
            await this.patientRepo.deletePatient(posyandu_id, patient_id)
        } catch(err) {
            handlePrismaError(err)
        }
    }
}