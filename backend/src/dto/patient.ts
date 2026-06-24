import z from "zod";
import type { Prisma } from "../generated/prisma/client.js";

export const CreatePatientSchema = z.object({
    nik: z.string().min(16, "Panjang NIK minimal 16 karakter"),
    picture: z.string().nullable(),
    nik_parent: z.string().min(16, "Panjang NIK minimal 16 karakter"),
    name: z.string().min(1, "Nama wajib diisi"),
    birth_date: z.string().date(),
    gender: z.enum(["Laki-Laki", "Perempuan"]),
    mother_name: z.string().min(1, "Nama Ibu wajib diisi"),
    father_name: z.string().nullable(),
    address: z.string().min(1, "Alamat wajib diisi"),
    phone_parent: z.string().min(10, "No telpon minimal 10 digit")
})

export const UpdatePatientSchema = CreatePatientSchema.partial().extend({
});

export const CreatePatientExaminationSchema = z.object({
    exam_date: z.string().date(),
    patient_id: z.string().min(1, "Nama pasien wajib diisi"),
    user_id: z.string().min(1, "Nama pemeriksa wajib diisi"),
    age_months: z.number(),
    weight: z.number(),
    height: z.number(),
    head_circumference: z.number(),
    arm_circumference: z.number(),
    notes: z.string().nullable(),
})

export const UpdatePatientExamReqSchema = CreatePatientExaminationSchema.partial().extend({
});

export interface TodayPatientItem {
    id: string;
    nik: string;
    name: string;
    birth_date: Date;
    gender: string;
    mother_name: string;
    phone_parent: string;
    examination: {
        id: string;
    }[];
}

export interface PatientBirthAndGenderOnly {
    gender: string, 
    birth_date: Date,
}

export type ExaminationWithPatient = Prisma.ExaminationGetPayload<{
    include: { patient: true }
}>;

export type CreatePatientReq = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientReq = z.infer<typeof UpdatePatientSchema>;
export type UpdatePatientExamReqSchema = z.infer<typeof UpdatePatientExamReqSchema>;
export type CreatePatientExamReq = z.infer<typeof CreatePatientExaminationSchema>;