import { supabase } from "../databases/supabase.js";
import type { ISupabase } from "./supabase.interface.js";

export class Supabase implements ISupabase {
    
    async uploadFile(file: Buffer, mimeType: string, fileExtension: string, existingFileName?: string | null): Promise<string> {
        const fileName = `${Date.now()} - ${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const filePath = existingFileName ? existingFileName : `patient-pictures/${fileName}`

        const { error} = await supabase.storage
        .from('pictures')
        .upload(filePath, file, {
            contentType: mimeType,
            upsert: true
        })

        if (error){
            throw new Error(`Supabase Upload Error: ${error.message}`)
        }
        
        const {data: urlData} = await supabase.storage
        .from('pictures')
        .getPublicUrl(filePath)

        return urlData.publicUrl;
    }
    
    async deleteFile(fileName: string): Promise<void> {
        const {error} = await supabase.storage
        .from("pictures")
        .remove([fileName])

        if (error){
            throw new Error(`Supabase delete error ${error.message}`)
        }
    }
}