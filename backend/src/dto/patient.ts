import z from "zod";
import type { Prisma } from "../generated/prisma/client.js";

export type PatientWithLatestExamination = Prisma.PatientGetPayload<{
    include: {
        examination: {
            take: 1,
            orderBy: { exam_date: 'desc' },
            include: { stunting_result: true }
        }
    }
}>

export const CreatePatientSchema = z.object({
    nik: z.string().trim().min(16, "Panjang NIK minimal 16 karakter").max(16, "Panjang NIK maksimal 16 karakter"),
    picture: z.string().nullable().optional(),
    nik_parent: z.string().trim().min(16, "Panjang NIK minimal 16 karakter").max(16, "Panjang NIK maksimal 16 karakter"),
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
    patient_id: z.string().uuid("Format patient_id harus UUID yang valid"),
    weight: z.number(),
    height: z.number(),
    head_circumference: z.number(),
    arm_circumference: z.number(),
    notes: z.string().nullable(),
})

export const UpdatePatientExamReqSchema = CreatePatientExaminationSchema.partial().extend({
});

export const CreateExamScheduleSchema = z.object({
    title: z.string().min(1, "Judul kegiatan wajib diisi"),
    description: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    scheduled_date: z.string().date(),
    time_start: z.string().datetime({ offset: true }).or(z.string().time()),
    time_end: z.string().datetime({ offset: true }).or(z.string().time()),
    status: z.string().min(1, "Status wajib diisi"),
})

export const UpdateExamScheduleReqSchema = CreateExamScheduleSchema.partial().extend({
});

export const PatientIdParamSchema = z.object({
    patient_id: z.string().trim().uuid("Format patient_id harus UUID yang valid"),
});

export const ExamIdParamSchema = z.object({
    exam_id: z.string().trim().uuid("Format exam_id harus UUID yang valid"),
});

export interface TodayPatientItem {
    id: string;
    nik: string;
    name: string;
    birth_date: Date;
    gender: string;
    mother_name: string;
    phone_parent: string;
    is_examined_today: boolean;
    today_examination_count: number;
}

export interface PatientBirthAndGenderOnly {
    gender: string, 
    birth_date: Date,
}

export type ExaminationWithPatient = Prisma.ExaminationGetPayload<{
    include: { patient: true }
}>;

export type ExaminationWithStunting = Prisma.ExaminationGetPayload<{
    include: { 
        patient: true,
        stunting_result: true,
    }
}>;

export type CreatePatientReq = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientReq = z.infer<typeof UpdatePatientSchema>;
export type UpdatePatientExamReqSchema = z.infer<typeof UpdatePatientExamReqSchema>;
export type CreatePatientExamReq = z.infer<typeof CreatePatientExaminationSchema>;
export type CreateExamScheduleReq = z.infer<typeof CreateExamScheduleSchema>;
export type UpdateExamScheduleReq = z.infer<typeof UpdateExamScheduleReqSchema>;

export type ScheduleWithUser = Prisma.ScheduleGetPayload<{
    include: { user: true }
}>;