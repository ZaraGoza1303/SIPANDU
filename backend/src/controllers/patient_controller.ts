import type { Request, Response } from "express";
import type { IPatientService } from "../services/patient_service.interface.js";
import { sendErrorResponse, sendSuccessfullResponse } from "../utils/response.js";
import { AppError } from "../utils/error.js";
import { CreatePatientSchema, UpdatePatientSchema } from "../dto/patient.js";
import { fileTypeFromBuffer } from "file-type";
import type { ISupabase } from "../services/supabase.interface.js";
import { getFileNameFromUrl, getFilePathWithFolder } from "../utils/format_url.js";

export class PatientController {
    private patientService: IPatientService
    private supabase: ISupabase;

    constructor(patientService: IPatientService, supabase: ISupabase) {
        this.patientService = patientService;
        this.supabase = supabase
    }

    async getAll(req: Request, res: Response){
        try {
            const posyandu_id = req.user?.role as string;
            const page = parseInt(String(req.query.page), 10) || 1;
            const limit = parseInt(String(req.query.limit), 10) || 10;
            const search = req.query.search ? String(req.query.search) : null;

            const patients = await this.patientService.getAll(posyandu_id, page, limit, search);
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
            let pictureUrl: string | null = null;
            
            if (req.file) {
                const maxSize = 1 * 1024 * 1024;
                if(req.file.size > maxSize) {
                    return res.status(400).json(sendErrorResponse("Ukuran gambar maksimal adalah 2MB"));
                }

                const detectedType = await fileTypeFromBuffer(req.file.buffer);
                const allowedExtension = ['jpg', 'jpeg', 'png'];

                if(!detectedType || !allowedExtension.includes(detectedType.ext)){
                    return res.status(400).json(sendErrorResponse("Format gambar harus JPEG, JPG, atau PNG asli!"));
                }

                const url = await this.supabase.uploadFile(req.file.buffer, req.file.mimetype, detectedType.ext)
                pictureUrl = url;
            }

            const posyandu_id = req.user?.posyandu_id as string;
            const validate = CreatePatientSchema.safeParse(req.body);

            if(!validate.success){
                const formatedErr = validate.error.flatten().fieldErrors;
                return res.status(400).json(sendErrorResponse("Validation Failed", formatedErr));
            }

            const patientData = {
                ...validate.data,
                picture: pictureUrl
            }

            await this.patientService.insertPatient(posyandu_id, patientData);
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
            const posyandu_id = req.user?.posyandu_id as string;
            const patient_id = req.query?.patient_id as string;
            let pictureUrl: string | undefined;

            if (req.file) {
                const maxSize = 1 * 1024 * 1024;
                if(req.file.size > maxSize) {
                    return res.status(400).json(sendErrorResponse("Ukuran gambar maksimal adalah 2MB"));
                }

                const detectedType = await fileTypeFromBuffer(req.file.buffer);
                const allowedExtension = ['jpg', 'jpeg', 'png'];

                if(!detectedType || !allowedExtension.includes(detectedType.ext)){
                    return res.status(400).json(sendErrorResponse("Format gambar harus JPEG, JPG, atau PNG asli!"));
                }

                const currentPatient = await this.patientService.getByID(posyandu_id, patient_id)
                let oldPictureName: string | undefined;

                if(currentPatient && currentPatient.picture){
                    oldPictureName = getFileNameFromUrl(currentPatient.picture)
                }

                pictureUrl = await this.supabase.uploadFile(
                    req.file.buffer,
                    req.file.mimetype,
                    detectedType.ext,
                    oldPictureName,
                )
            }

            const validate = UpdatePatientSchema.safeParse(req.body);
            if(!validate.success){
                const formatedErr = validate.error.flatten().fieldErrors;
                return res.status(400).json(sendErrorResponse("Validation Failed", formatedErr));
            }

            const updatedData = {
                ...validate.data,
                ...(pictureUrl && {picture: pictureUrl})
            }

            await this.patientService.updatePatient(posyandu_id, patient_id, updatedData);
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

            const currentPatient = await this.patientService.getByID(posyandu_id, patient_id);
            if (currentPatient && currentPatient.picture) {
                const filePathWithFolder = getFilePathWithFolder(currentPatient.picture, 'pictures/');
                
                if (filePathWithFolder) {
                    await this.supabase.deleteFile(filePathWithFolder);
                }
            }

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