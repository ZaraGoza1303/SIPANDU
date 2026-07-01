import { AppError } from "../utils/error.js";
import type { ExaminationWithPatient } from "../dto/patient.js";
import type { Examination, Prisma, PrismaClient, Schedule } from "../generated/prisma/client.js";
import type { ExaminationCreateInput, ExaminationUpdateInput } from "../generated/prisma/models.js";
import type { IExaminationsRepository } from "./examinations.interface.js";

export class ExaminationsRepository implements IExaminationsRepository {
    private db: PrismaClient;

    constructor(db: PrismaClient) {
        this.db = db;
    }

    async getExamByID(posyandu_id: string, exam_id: string): Promise<ExaminationWithPatient | null> {
        const exam = await this.db.examination.findFirst({
            where: {
                id: exam_id,
                patient: {
                    posyandu_id
                }
            },
            include: {
                patient: true
            }
        })

        return exam;
    }

    async getExamScheduleByID(posyandu_id: string, exam_id: string): Promise<Schedule | null> {
        const schedule = await this.db.schedule.findFirst({
            where: {
                id: exam_id,
                posyandu_id: posyandu_id,
            }
        })

        return schedule;
    }

    async insertExamination(newExam: ExaminationCreateInput, tx?: Prisma.TransactionClient): Promise<Examination> {
        const client = tx || this.db
        const result = await client.examination.create({
            data: newExam
        })

        return result;
    }

    async insertExamSchedule(newSchedule: Prisma.ScheduleCreateInput): Promise<void> {
        await this.db.schedule.create({
            data: newSchedule
        })
    }

    async updateExamSchedule(posyandu_id: string, exam_id: string, newSchedule: Prisma.ScheduleUpdateInput): Promise<void> {
        const result = await this.db.schedule.updateMany({
            where: {
                id: exam_id,
                posyandu_id: posyandu_id
            },
            data: newSchedule
        })

        if (result.count === 0) {
            throw new AppError("Jadwal pemeriksaan tidak ditemukan", 404);
        }
    }

    async updateExamination(posyandu_id: string, exam_id: string, newExamination: ExaminationUpdateInput, tx?: Prisma.TransactionClient): Promise<void> {
        const client = tx || this.db

        const result = await client.examination.updateMany({
            where: {
                id: exam_id,
                patient: {
                    posyandu_id
                }
            },

            data: newExamination
        })

        if (result.count === 0) {
            throw new AppError("Data pemeriksaan tidak ditemukan", 404);
        }
    }

    async checkScheduleExam(posyandu_id: string, today: Date, tomorrow: Date): Promise<Boolean> {
        const isScheduleExists = await this.db.schedule.count({
            where: {
                posyandu_id: posyandu_id,
                scheduled_date: {
                    gte: today,
                    lte: tomorrow
                }
            },
        })

        return isScheduleExists > 0;
    }

    async deleteExamSchedule(posyandu_id: string, exam_id: string): Promise<void> {
    const result = await this.db.schedule.deleteMany({
        where: {
            id: exam_id,
            posyandu_id: posyandu_id
        }
    });

    if (result.count === 0) {
        throw new AppError("Jadwal pemeriksaan tidak ditemukan", 404);
    }
}
    
}