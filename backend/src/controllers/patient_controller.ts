import type { Request, Response } from "express";
import type { IPatientService } from "../services/patient_service.interface.js";
import { sendErrorResponse, sendSuccessfullResponse } from "../utils/response.js";
import { AppError } from "../utils/error.js";
import { CreatePatientSchema, UpdatePatientSchema } from "../dto/patient.js";

export class PatientController {
    private patientService: IPatientService

    constructor(patientService: IPatientService) {
        this.patientService = patientService
    }

    async getAll(req: Request, res: Response){
        try {
           const posyandu_id = req.user?.role as string;

            const page = parseInt(String(req.query.page), 10) || 1;
            const limit = parseInt(String(req.query.limit), 10) || 10;

            const patients = await this.patientService.getAll(posyandu_id, page, limit);
            return res.status(200).json(sendSuccessfullResponse(patients, "Berhasil menampilkan data pasien"))

        } catch (err: any) {
            if(err instanceof AppError){
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal menampilkan data pasien", err.message))
        }
    }

    async getByID(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;
            const patient_id = req.query.patient_id as string;

            const patient = await this.patientService.getByID(posyandu_id, patient_id);
            return res.status(200).json(sendSuccessfullResponse(patient, "Berhasil menampilkan data pasien"))

        } catch (err:any) {
            if(err instanceof AppError){
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal menampilkan data pasien", err.message))
        }
    }

    async addPatient(req: Request, res: Response) {
        try {
            if (!req.body) {
                return res.status(400).json(sendErrorResponse("Request body kosong"));
            }

            const posyandu_id = req.user?.posyandu_id as string;
            const validate = CreatePatientSchema.safeParse(req.body);

            if(!validate.success){
                const formatedErr = validate.error.flatten().fieldErrors;
                return res.status(400).json(sendErrorResponse("Validation Failed", formatedErr));
            }

            await this.patientService.insertPatient(posyandu_id, validate.data);
            return res.status(201).json(sendSuccessfullResponse("Patient berhasil ditambahkan"))

        } catch (err: any){
            if(err instanceof AppError){
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal menambahkan data pasien", err.message))
        }
    }

    async updatePatient(req: Request, res: Response) {
        try {
            if (!req.body) {
                return res.status(400).json(sendErrorResponse("Request body kosong"));
            }

            const posyandu_id = req.user?.posyandu_id as string;
            const patient_id = req.query?.patient_id as string;
            const validate = UpdatePatientSchema.safeParse(req.body);

            if(!validate.success){
                const formatedErr = validate.error.flatten().fieldErrors;
                return res.status(400).json(sendErrorResponse("Validation Failed", formatedErr));
            }

            await this.patientService.updatePatient(posyandu_id, patient_id, validate.data);
            return res.status(200).json(sendSuccessfullResponse("Data Patient berhasil diupdate"))
            
        } catch (err: any) {
            if(err instanceof AppError){
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal mengubah data pasien", err.message))
        }
    }

    async deletePatient(req: Request, res: Response) {
        try {
            const posyandu_id = req.user?.posyandu_id as string;
            const patient_id = req.query?.patient_id as string;

            await this.patientService.deletePatient(posyandu_id, patient_id);
            return res.status(200).json(sendSuccessfullResponse("Patient berhasil dihapus"))

        } catch (err: any) {
            if(err instanceof AppError){
                return res.status(err.statusCode).json(sendErrorResponse(err.message, err.message))
            }

            return res.status(500).json(sendErrorResponse("Gagal menghapus data pasien", err.message))
        }
    }
}