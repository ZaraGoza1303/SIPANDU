import z from "zod";

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

export type CreatePatientReq = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientReq = z.infer<typeof UpdatePatientSchema>;