import type { Request, Response } from "express";
import { sendErrorResponse, sendSuccessfullResponse } from "../utils/response.js";
import { AppError } from "../utils/error.js";
import { CreateExamScheduleSchema, CreatePatientExaminationSchema, UpdatePatientExamReqSchema } from "../dto/patient.js";
import type { IExaminationsService } from "../services/examinations.interface.js";

export class ExaminationController {
    private examinationsService: IExaminationsService;

    constructor(examinationsService: IExaminationsService) {
        this.examinationsService = examinationsService;
    }

    async addExamination(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;

            if(!req.body){
                return res.status(400).json(sendErrorResponse("Request body empty"))
            };

            const validate = CreatePatientExaminationSchema.safeParse(req.body);
            if(!validate.success){
                const formatedErr = validate.error.flatten().fieldErrors;
                return res.status(400).json(sendErrorResponse("Validation Failed", formatedErr));
            }

            const result = await this.examinationsService.addPatientExamination(posyandu_id, validate.data);
            return res.status(201).json(sendSuccessfullResponse("Pemeriksaan berhasil ditambahkan", result))

        } catch(err: any){
            if(err instanceof AppError){
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal menambahkan data pemeriksaan", err.message))
        }
    }

    async addSchedule(req: Request, res: Response){
        try {
            const posyandu_id = req.user?.posyandu_id as string;
            const user_id = req.user?.id as string;

            if(!req.body){
                return res.status(400).json(sendErrorResponse("Request body empty"))
            };

            const validate = CreateExamScheduleSchema.safeParse(req.body);
            if(!validate.success){
                const formatedErr = validate.error.flatten().fieldErrors;
                return res.status(400).json(sendErrorResponse("Validation Failed", formatedErr));
            }

            await this.examinationsService.addExamSchedule(posyandu_id, user_id, validate.data);
            return res.status(201).json(sendSuccessfullResponse("Jadwal Pemeriksaan berhasil ditambahkan"))

        } catch(err: any){
            if(err instanceof AppError){
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal menambahkan jadwal pemeriksaan", err.message))
        }
    }

    async updateExamination(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;
            const exam_id = req.params.exam_id as string;

            if(!req.body){
                return res.status(400).json(sendErrorResponse("Request body empty"))
            };

            const validate = UpdatePatientExamReqSchema.safeParse(req.body);
            if(!validate.success){
                const formatedErr = validate.error.flatten().fieldErrors;
                return res.status(400).json(sendErrorResponse("Validation Failed", formatedErr));
            }

            const result = await this.examinationsService.updatePatientExamination(posyandu_id, exam_id, validate.data);
            return res.status(200).json(sendSuccessfullResponse("Data pemeriksaan berhasil diupdate", result))

        } catch (err: any) {
            if(err instanceof AppError){
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal mengubah data pemeriksaan", err.message))
        }
    }
}
