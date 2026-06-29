export const getFileNameFromUrl = (fileUrl: string) => {
    const filename = fileUrl.split('/').pop() || undefined;
    return filename;
}

export const getFilePathWithFolder = (fileUrl: string, bucketName: string) => {
    const urlPicture = fileUrl;
    const filePathWithFolder = urlPicture.split(bucketName)[1];

    return filePathWithFolder;
}