import type { CreatePatientExamReq, CreateExamScheduleReq, UpdatePatientExamReqSchema } from "../dto/patient.js";
import { calculateZScoreWHO } from "../dto/zscore.js";
import type { PrismaClient, StuntingResult } from "../generated/prisma/client.js";
import type { ExaminationCreateInput, ExaminationUpdateInput, ScheduleCreateInput, StuntingResultCreateInput, StuntingResultUpdateInput } from "../generated/prisma/models.js";
import type { IExaminationsRepository } from "../repositories/examinations.interface.js";
import type { IPatientsRepository } from "../repositories/patient_repository.interface.js";
import type { IStuntingResultsRepository } from "../repositories/stunting-results.interface.js";
import { calculateAgeMonths } from "../utils/calculate.js";
import { AppError, handlePrismaError } from "../utils/error.js";
import { checkPosyanduID } from "../utils/func.js";
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

    async addPatientExamination(newExamination: CreatePatientExamReq): Promise<StuntingResult> {
        try {
            const patientInfo = await this.patientsRepo.getPatientBirthAndGenderOnly(newExamination.patient_id);
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
        checkPosyanduID(posyandu_id);

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

            await this.examinationsRepo.insertExamSchedule(newScheduleReq);

        } catch(err) {
            handlePrismaError(err)
        }
    }
    
    async updatePatientExamination(exam_id: string, newExamination: UpdatePatientExamReqSchema): Promise<StuntingResult> {
        try {
            const existingExam = await this.examinationsRepo.getExamByID(exam_id);
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
                
                await this.examinationsRepo.updateExamination(exam_id, newExaminationReq, tx);

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
    
}