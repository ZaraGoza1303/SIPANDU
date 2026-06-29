export interface ISupabase {
    uploadFile(file: Buffer, mimeType: string, fileExtension: string, existingFileName?: string | null): Promise<string>
    deleteFile(fileName: string): Promise<void>;
}