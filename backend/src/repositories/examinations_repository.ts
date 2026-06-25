import type { ExaminationWithPatient } from "../dto/patient.js";
import type { Examination, Prisma, PrismaClient } from "../generated/prisma/client.js";
import type { ExaminationCreateInput, ExaminationUpdateInput } from "../generated/prisma/models.js";
import type { IExaminationsRepository } from "./examinations.interface.js";

export class ExaminationsRepository implements IExaminationsRepository {
    private db: PrismaClient;

    constructor(db: PrismaClient) {
        this.db = db;
    }

    async getExamByID(exam_id: string): Promise<ExaminationWithPatient | null> {
        const exam = await this.db.examination.findUnique({
            where: {
                id: exam_id
            },
            include: {
                patient: true
            }
        })

        return exam;
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

    async updateExamination(exam_id: string, newExamination: ExaminationUpdateInput, tx?: Prisma.TransactionClient): Promise<void> {
        const client = tx || this.db

        await client.examination.update({
            where: {
                id: exam_id,
            },

            data: newExamination
        })
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
    
}