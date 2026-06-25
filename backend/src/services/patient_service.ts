import type { CreateExamScheduleReq, CreatePatientExamReq, CreatePatientReq, TodayPatientItem, UpdatePatientExamReqSchema, UpdatePatientReq } from "../dto/patient.js";
import type { PaginatedResponse } from "../dto/response.js";
import { calculateZScoreWHO } from "../dto/zscore.js";
import type { Patient, PrismaClient, StuntingResult } from "../generated/prisma/client.js";
import type { ExaminationCreateInput, ExaminationUpdateInput, PatientCreateInput, PatientUpdateInput, ScheduleCreateInput, StuntingResultCreateInput, StuntingResultUpdateInput } from "../generated/prisma/models.js";
import type { IPatientRepository } from "../repositories/patient_repository.interface.js";
import { calculateAgeMonths } from "../utils/calculate.js";
import { AppError, handlePrismaError } from "../utils/error.js";
import type { IPatientService } from "./patient_service.interface.js";

export class PatientService implements IPatientService {
    private patientRepo: IPatientRepository
    private prismaClient: PrismaClient

    constructor(patientRepo: IPatientRepository, prismaClient: PrismaClient) {
        this.patientRepo = patientRepo;
        this.prismaClient = prismaClient
    }

    checkPosyanduID(posyandu_id: string): void {
        if(!posyandu_id) {
            throw new AppError("Not Found", 404)
        }
    }

    async getAllTodayPatients(posyandu_id: string, page: number, limit: number, search?: string | null): Promise<PaginatedResponse<TodayPatientItem>> {
        this.checkPosyanduID(posyandu_id);

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tomorrow = new Date();
            tomorrow.setHours(23, 59, 59, 999);
            
            const isScheduleExists = await this.patientRepo.checkScheduleExam(posyandu_id, today, tomorrow);
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

    async addPatientExamination(newExamination: CreatePatientExamReq): Promise<StuntingResult> {
        try {
            const patientInfo = await this.patientRepo.getPatientBirthAndGenderOnly(newExamination.patient_id);
            if (!patientInfo) throw new Error("Pasien tidak ditemukan");

            const ageMonths = calculateAgeMonths(patientInfo.birth_date)
            const zScoreResult = calculateZScoreWHO(
                newExamination.weight,
                newExamination.height,
                ageMonths,
                patientInfo.gender,
            )

            const result = await this.prismaClient.$transaction(async (tx) => {
                const newExaminationReq: ExaminationCreateInput = {
                    exam_date: newExamination.exam_date,
                    patient: {
                        connect: { id: newExamination.patient_id }
                    },
                    user: {
                        connect: { id: newExamination.user_id }
                    },
                    
                    weight: newExamination.weight,
                    height: newExamination.height, 
                    head_circumference: newExamination.head_circumference,
                    arm_circumference: newExamination.arm_circumference,
                    notes: newExamination.notes ?? "", 
                };
                
                const newExamCreated = await this.patientRepo.insertExamination(newExaminationReq, tx);

                const newStuntingResult: StuntingResultCreateInput = {
                    examination: {
                        connect: {id: newExamCreated.id}
                    },
                    age_months: ageMonths,
                    weight_for_age_zscore: zScoreResult.wfa,
                    height_for_age_zscore: zScoreResult.hfa,
                    weight_for_height_zscore: zScoreResult.wfh,
                    stunting_status: zScoreResult.stuntingStatus,
                    wasting_status: zScoreResult.wastingStatus,
                    underweight_status: zScoreResult.underweightStatus,
                }

                return await this.patientRepo.insertStuntingResult(newStuntingResult, tx)
            })

            return result;
            
        } catch (err){
            handlePrismaError(err)
        }
    }

        
    async addExamSchedule(posyandu_id: string, user_id: string, newSchedule: CreateExamScheduleReq): Promise<void> {
        this.checkPosyanduID(posyandu_id);

        try {
            if(!user_id){
                throw new AppError("Forbidden", 403)
            }

            const newScheduleReq: ScheduleCreateInput = {
                posyandu: {
                    connect: {id: posyandu_id}
                },
                user: {
                    connect: {id: user_id}
                },
                scheduled_date: newSchedule.scheduled_date,
                time_start: newSchedule.time_start,
                time_end: newSchedule.time_end,
                status: newSchedule.status,
            }

            await this.patientRepo.insertExamSchedule(newScheduleReq);

        } catch(err) {
            handlePrismaError(err)
        }
    }

    async updatePatientExamination(exam_id: string, newExamination: UpdatePatientExamReqSchema): Promise<StuntingResult> {
        try {
            const existingExam = await this.patientRepo.getExamByID(exam_id);
            if (!existingExam) throw new Error("Data pemeriksaan tidak ditemukan");

            const examDate = newExamination.exam_date ?? existingExam.exam_date;
            const weight = newExamination.weight ?? existingExam.weight;
            const height = newExamination.height ?? existingExam.height;

            const ageMonths = calculateAgeMonths(existingExam.patient.birth_date);
            const zScoreResult = calculateZScoreWHO(
                weight,
                height,
                ageMonths,
                existingExam.patient.gender
            );

            const result = await this.prismaClient.$transaction(async (tx) => {
                const newExaminationReq: ExaminationUpdateInput = {
                    exam_date: examDate,
                    weight: weight,
                    height: height, 
                    head_circumference: newExamination.head_circumference ?? existingExam.head_circumference,
                    arm_circumference: newExamination.arm_circumference ?? existingExam.arm_circumference,
                    notes: newExamination.notes ?? "", 
                };
                
                await this.patientRepo.updateExamination(exam_id, newExaminationReq, tx);

                const newStuntingResult: StuntingResultUpdateInput = {
                    age_months: ageMonths,
                    weight_for_age_zscore: zScoreResult.wfa,
                    height_for_age_zscore: zScoreResult.hfa,
                    weight_for_height_zscore: zScoreResult.wfh,
                    stunting_status: zScoreResult.stuntingStatus,
                    wasting_status: zScoreResult.wastingStatus,
                    underweight_status: zScoreResult.underweightStatus,
                }

                return await this.patientRepo.updateStuntingResult(exam_id, newStuntingResult, tx)
            })

            return result;

        } catch(err){
            handlePrismaError(err)
        }
    }
}