import type { IPatientsRepository } from "./patient_repository.interface.js";
import type { Patient, PrismaClient } from "../generated/prisma/client.js";
import type { PatientCreateInput, PatientUpdateInput } from "../generated/prisma/models.js";
import type { PaginatedResponse } from "../dto/response.js";
import { AppError } from "../utils/error.js";
import type { TodayPatientItem } from "../dto/patient.js";

export class PatientsRepository implements IPatientsRepository {
    private db: PrismaClient;

    constructor(db: PrismaClient) {
        this.db = db;
    }

    async getAllTodayPatients(posyandu_id: string, page: number, limit: number, today: Date, tomorrow: Date, search?: string | null): Promise<PaginatedResponse<TodayPatientItem>> {
        const offset = (page - 1) * limit;
        const search_filter: any = search ? {
            OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { nik: { contains: search, mode: 'insensitive' } },
            ]
        } : {};

        const[patients, total_patients] = await Promise.all([
            this.db.patient.findMany({
                where: {
                    posyandu_id: posyandu_id,
                    ...search_filter,
                },
                select: {
                    id: true,
                    nik: true,
                    name: true,
                    birth_date: true,
                    gender: true,
                    mother_name: true,
                    phone_parent: true,
                    examination: {
                        where: {
                            exam_date: {
                                gte: today,
                                lt: tomorrow
                            }
                        },
                        select: {
                            id: true 
                        }
                    }
                },
                skip: offset,
                take: limit,
                orderBy: {name: 'asc'}
            }),
            this.db.patient.count({
                where: {
                    posyandu_id: posyandu_id,
                    ...search_filter,
                }
            })
        ])

        const res: PaginatedResponse<TodayPatientItem> = {
            items: patients,
            next_cursor: null,
            meta: {
                total_items: total_patients,
                current_page: page,
                limit,
                total_pages: Math.ceil(total_patients / limit)
            }
        }

        return res
    }

    async getAll(posyandu_id: string, page: number, limit: number, search?: string | null): Promise<PaginatedResponse<Patient>> {
        const offset = (page - 1) * limit;
        const search_filter: any = search ? {
            OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { nik: { contains: search, mode: 'insensitive' } },
            ]
        } : {};

        const[patients, total_patients] = await Promise.all([
            this.db.patient.findMany({
                where: {
                    posyandu_id: posyandu_id,
                    ...search_filter,
                },
                skip: offset,
                take: limit,
                orderBy: {name: 'asc'}
            }),
            this.db.patient.count({
                where: {
                    posyandu_id: posyandu_id,
                    ...search_filter,
                }
            })
        ])

        const res: PaginatedResponse<Patient> = {
            items: patients,
            next_cursor: null,
            meta: {
                total_items: total_patients,
                current_page: page,
                limit,
                total_pages: Math.ceil(total_patients / limit)
            }
        }

        return res
    }

    async getByID(posyandu_id: string, patient_id: string): Promise<Patient | null> {
        const patient = await this.db.patient.findFirst({
            where: {
                id: patient_id,
                posyandu_id: posyandu_id
            }
        })

        return patient
    }

    async insertPatient(newPatient: PatientCreateInput): Promise<void> {
        await this.db.patient.create({
            data: newPatient
        })
    }

    async updatePatient(posyandu_id: string, patient_id: string, newPatient: PatientUpdateInput): Promise<void> {
        const updateResult = await this.db.patient.updateMany({
            where: {
                id: patient_id, 
                posyandu_id: posyandu_id
            }, 
            data: newPatient
        })

        if(updateResult.count == 0) {
            throw new AppError("Pasien tidak ditemukan", 404);
        }
    }

    async deletePatient(posyandu_id: string, patient_id: string): Promise<void> {
        const deleteResult = await this.db.patient.deleteMany({
            where: {
                id: patient_id,
                posyandu_id: posyandu_id
            }
        })

        if (deleteResult.count === 0) {
            throw new AppError("Pasien tidak ditemukan", 404);
        }
    }
}