import type { Request, Response } from "express";
import { sendErrorResponse, sendSuccessfullResponse } from "../utils/response.js";
import { AppError } from "../utils/error.js";
import { isValidUUID } from "../utils/validate_uuid.js";
import { CreateExamScheduleSchema, CreatePatientExaminationSchema, UpdateExamScheduleReqSchema, UpdatePatientExamReqSchema } from "../dto/patient.js";
import type { IExaminationsService } from "../services/examinations.interface.js";

export class ExaminationController {
    private examinationsService: IExaminationsService;

    constructor(examinationsService: IExaminationsService) {
        this.examinationsService = examinationsService;
    }

    async addExamination(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;

            if (!req.body) {
                return res.status(400).json(sendErrorResponse("Request body empty"))
            };

            const validate = CreatePatientExaminationSchema.safeParse(req.body);
            if (!validate.success) {
                const formatedErr = validate.error.flatten().fieldErrors;
                return res.status(400).json(sendErrorResponse("Validation Failed", formatedErr));
            }

            const result = await this.examinationsService.addPatientExamination(posyandu_id, validate.data);
            return res.status(201).json(sendSuccessfullResponse("Pemeriksaan berhasil ditambahkan", result))

        } catch (err: unknown) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal menambahkan data pemeriksaan", (err as Error).message))
        }
    }

    async addSchedule(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;
            const user_id = req.user?.id as string;

            if (!req.body) {
                return res.status(400).json(sendErrorResponse("Request body empty"))
            };

            const validate = CreateExamScheduleSchema.safeParse(req.body);
            if (!validate.success) {
                const formatedErr = validate.error.flatten().fieldErrors;
                return res.status(400).json(sendErrorResponse("Validation Failed", formatedErr));
            }

            await this.examinationsService.addExamSchedule(posyandu_id, user_id, validate.data);
            return res.status(201).json(sendSuccessfullResponse("Jadwal Pemeriksaan berhasil ditambahkan"))

        } catch (err: unknown) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal menambahkan jadwal pemeriksaan", (err as Error).message))
        }
    }

    async updateExamination(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;
            const exam_id = req.params.exam_id as string;

            if (!isValidUUID(exam_id)) {
                return res.status(400).json(sendErrorResponse("ID pemeriksaan tidak valid"));
            }

            if (!req.body) {
                return res.status(400).json(sendErrorResponse("Request body empty"))
            };

            const validate = UpdatePatientExamReqSchema.safeParse(req.body);
            if (!validate.success) {
                const formatedErr = validate.error.flatten().fieldErrors;
                return res.status(400).json(sendErrorResponse("Validation Failed", formatedErr));
            }

            const result = await this.examinationsService.updatePatientExamination(posyandu_id, exam_id, validate.data);
            return res.status(200).json(sendSuccessfullResponse("Data pemeriksaan berhasil diupdate", result))

        } catch (err: unknown) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal mengubah data pemeriksaan", (err as Error).message))
        }
    }

    async updateExamSchedule(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;
            const exam_id = req.params.exam_id as string;

            if (!isValidUUID(exam_id)) {
                return res.status(400).json(sendErrorResponse("ID jadwal tidak valid"));
            }

            if (!req.body) {
                return res.status(400).json(sendErrorResponse("Request body empty"))
            };

            const validate = UpdateExamScheduleReqSchema.safeParse(req.body);
            if (!validate.success) {
                const formatedErr = validate.error.flatten().fieldErrors;
                return res.status(400).json(sendErrorResponse("Validation Failed", formatedErr));
            }

            const result = await this.examinationsService.updateExamSchedule(posyandu_id, exam_id, validate.data);
            return res.status(200).json(sendSuccessfullResponse("Data schedule berhasil diupdate", result))

        } catch (err: unknown) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal mengubah data pemeriksaan", (err as Error).message));
        }
    }

    async getAllExaminations(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || null;

            const result = await this.examinationsService.getAllExaminations(posyandu_id, page, limit, search);
            return res.status(200).json(sendSuccessfullResponse("Berhasil mendapatkan data pemeriksaan", result));

        } catch (err: unknown) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal mendapatkan data pemeriksaan", (err as Error).message))
        }
    }

    async getAllSchedules(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || null;
            const tanggal = req.query.tanggal as string || null;

            const result = await this.examinationsService.getAllSchedules(posyandu_id, page, limit, search, tanggal);
            return res.status(200).json(sendSuccessfullResponse("Berhasil mendapatkan data jadwal", result));

        } catch (err: unknown) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal mendapatkan data jadwal", (err as Error).message))
        }
    }

    async markAsCompleted(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;
            const exam_id = req.params.id as string;

            if (!isValidUUID(exam_id)) {
                return res.status(400).json(sendErrorResponse("ID jadwal tidak valid"));
            }

            await this.examinationsService.markScheduleAsCompleted(posyandu_id, exam_id);
            return res.status(200).json(sendSuccessfullResponse("Jadwal berhasil ditandai selesai"));

        } catch (err: unknown) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal menandai jadwal selesai", (err as Error).message))
        }
    }

    async getTodayPendingCount(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;

            if (!posyandu_id) {
                return res.status(400).json(sendErrorResponse("posyandu_id tidak ditemukan"));
            }

            const result = await this.examinationsService.countTodayPendingExaminations(posyandu_id);
            return res.status(200).json(sendSuccessfullResponse("Berhasil mendapatkan data pemeriksaan tertunda", result));

        } catch (err: unknown) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal mendapatkan data pemeriksaan tertunda", (err as Error).message))
        }
    }

    async getPatientExaminationLog(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;
            const patient_id = req.params.patient_id as string;

            if (!posyandu_id) {
                return res.status(400).json(sendErrorResponse("posyandu_id tidak ditemukan"));
            }

            if (!isValidUUID(patient_id)) {
                return res.status(400).json(sendErrorResponse("ID pasien tidak valid"));
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.examinationsService.getExaminationsByPatient(posyandu_id, patient_id, page, limit);
            return res.status(200).json(sendSuccessfullResponse("Berhasil mendapatkan log pemeriksaan pasien", result));

        } catch (err: unknown) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal mendapatkan log pemeriksaan pasien", (err as Error).message))
        }
    }
}
