import type { CreatePatientExamReq, CreateExamScheduleReq, UpdatePatientExamReqSchema, UpdateExamScheduleReq } from "../dto/patient.js";
import { calculateZScoreWHO } from "../dto/zscore.js";
import type { PrismaClient, StuntingResult } from "../generated/prisma/client.js";
import type { ExaminationCreateInput, ExaminationUpdateInput, ScheduleCreateInput, ScheduleUpdateInput, StuntingResultCreateInput, StuntingResultUpdateInput } from "../generated/prisma/models.js";
import type { IExaminationsRepository } from "../repositories/examinations.interface.js";
import type { IPatientsRepository } from "../repositories/patient_repository.interface.js";
import type { IStuntingResultsRepository } from "../repositories/stunting-results.interface.js";
import { calculateAgeMonths } from "../utils/calculate.js";
import { AppError, handlePrismaError } from "../utils/error.js";
import type { IExaminationsService } from "./examinations.interface.js";

export class ExaminationsService implements IExaminationsService {
    private prismaClient: PrismaClient;
    private patientsRepo: IPatientsRepository;
    private stuntingResultsRepo: IStuntingResultsRepository;
    private examinationsRepo: IExaminationsRepository;

    constructor (
        prismaClient: PrismaClient,
        patientsRepo: IPatientsRepository,
        stuntingResultsRepo: IStuntingResultsRepository,
        examinationsRepo: IExaminationsRepository,
    ) {
        this.prismaClient = prismaClient;
        this.patientsRepo = patientsRepo;
        this.stuntingResultsRepo = stuntingResultsRepo;
        this.examinationsRepo = examinationsRepo;
    }

    async addPatientExamination(posyandu_id: string, newExamination: CreatePatientExamReq): Promise<StuntingResult> {
        try {
            const patientInfo = await this.patientsRepo.getByID(posyandu_id, newExamination.patient_id);
            if (!patientInfo) throw new AppError("Pasien tidak ditemukan", 404);

            const ageMonths = calculateAgeMonths(patientInfo.birth_date)
            const zScoreResult = calculateZScoreWHO(
                newExamination.weight,
                newExamination.height,
                ageMonths,
                patientInfo.gender,
            )

            const result = await this.prismaClient.$transaction(async (tx) => {
                const newExaminationReq: ExaminationCreateInput = {
                    exam_date: new Date(newExamination.exam_date),
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
                
                const newExamCreated = await this.examinationsRepo.insertExamination(newExaminationReq, tx);

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

                return await this.stuntingResultsRepo.insertStuntingResult(newStuntingResult, tx)
            })

            return result;
            
        } catch (err){
            handlePrismaError(err)
        }
    }

    async addExamSchedule(posyandu_id: string, user_id: string, newSchedule: CreateExamScheduleReq): Promise<void> {
        try {
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

            await this.examinationsRepo.insertExamSchedule(newScheduleReq);

        } catch(err) {
            handlePrismaError(err)
        }
    }

    async updateExamSchedule(posyandu_id: string, exam_id: string, newSchedule: UpdateExamScheduleReq): Promise<void> {
        try {
            const updateData: ScheduleUpdateInput = {};

            if (newSchedule.scheduled_date !== undefined) updateData.scheduled_date = new Date(newSchedule.scheduled_date);
            if (newSchedule.time_start !== undefined) updateData.time_start = newSchedule.time_start;
            if (newSchedule.time_end !== undefined) updateData.time_end = newSchedule.time_end;
            if (newSchedule.status !== undefined) updateData.status = newSchedule.status;

            await this.examinationsRepo.updateExamSchedule(posyandu_id, exam_id, updateData);

        } catch (err) {
            handlePrismaError(err);
        }
    }
    
    async updatePatientExamination(posyandu_id: string, exam_id: string, newExamination: UpdatePatientExamReqSchema): Promise<StuntingResult> {
        try {
            const existingExam = await this.examinationsRepo.getExamByID(posyandu_id, exam_id);
            if (!existingExam) throw new AppError("Data pemeriksaan tidak ditemukan", 404);

            const examDate = newExamination.exam_date ? new Date(newExamination.exam_date) : existingExam.exam_date;
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
                };

                if(newExamination.head_circumference !== undefined) newExaminationReq.head_circumference = newExamination.head_circumference;
                if(newExamination.arm_circumference !== undefined) newExaminationReq.arm_circumference = newExamination.arm_circumference;
                if(newExamination.notes !== undefined) newExaminationReq.notes = newExamination.notes;
                
                await this.examinationsRepo.updateExamination(posyandu_id, exam_id, newExaminationReq, tx);

                const newStuntingResult: StuntingResultUpdateInput = {
                    age_months: ageMonths,
                    weight_for_age_zscore: zScoreResult.wfa,
                    height_for_age_zscore: zScoreResult.hfa,
                    weight_for_height_zscore: zScoreResult.wfh,
                    stunting_status: zScoreResult.stuntingStatus,
                    wasting_status: zScoreResult.wastingStatus,
                    underweight_status: zScoreResult.underweightStatus,
                }

                return await this.stuntingResultsRepo.updateStuntingResult(exam_id, newStuntingResult, tx)
            })

            return result;

        } catch(err){
            handlePrismaError(err)
        }
    }
    
    async deleteExamSchedule(posyandu_id: string, exam_id: string): Promise<void> {
            try {
                await this.examinationsRepo.deleteExamSchedule(posyandu_id, exam_id);
            } catch (err) {
                handlePrismaError(err);
            }
        }

}