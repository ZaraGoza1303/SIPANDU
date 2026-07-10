import { AppError } from "../utils/error.js";
import type { ExaminationWithPatient, ExaminationWithStunting, ScheduleWithUser } from "../dto/patient.js";
import type { PaginatedResponse } from "../dto/response.js";
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

    async getAllExaminations(posyandu_id: string, page: number, limit: number, search?: string | null): Promise<PaginatedResponse<ExaminationWithStunting>> {
        const offset = (page - 1) * limit;
        const search_filter: any = search ? {
            OR: [
            { patient: { name: { contains: search, mode: 'insensitive' } } },
            { notes: { contains: search, mode: 'insensitive' } },
            ]
        } : {};

        const [examinations, total_examinations] = await Promise.all([
            this.db.examination.findMany({
                where: {
                    patient: {
                        posyandu_id: posyandu_id,
                    },
                    ...search_filter,
                },
                skip: offset,
                take: limit,
                orderBy: { exam_date: 'desc' },
                include: {
                    patient: true,
                    stunting_result: true,
                },
            }),
            this.db.examination.count({
                where: {
                    patient: {
                        posyandu_id: posyandu_id,
                    },
                    ...search_filter,
                },
            })
        ]);

        const res: PaginatedResponse<ExaminationWithStunting> = {
            items: examinations,
            next_cursor: null,
            meta: {
                total_items: total_examinations,
                current_page: page,
                limit,
                total_pages: Math.ceil(total_examinations / limit)
            }
        }

        return res;
    }

    async getAllSchedules(posyandu_id: string, page: number, limit: number, search?: string | null, tanggal?: string | null): Promise<PaginatedResponse<ScheduleWithUser>> {
        const offset = (page - 1) * limit;
        const where: any = {
            posyandu_id: posyandu_id,
        };

        // Filter by date
        if (tanggal) {
            const filterDate = new Date(tanggal);
            where.scheduled_date = filterDate;
        }

        // Search by status or user name
        if (search) {
            where.OR = [
                { status: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [schedules, total_schedules] = await Promise.all([
            this.db.schedule.findMany({
                where,
                skip: offset,
                take: limit,
                orderBy: { scheduled_date: 'desc' },
                include: {
                    user: true,
                },
            }),
            this.db.schedule.count({ where }),
        ]);

        const res: PaginatedResponse<ScheduleWithUser> = {
            items: schedules,
            next_cursor: null,
            meta: {
                total_items: total_schedules,
                current_page: page,
                limit,
                total_pages: Math.ceil(total_schedules / limit)
            }
        }

        return res;
    }
    
}