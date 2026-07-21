export declare const cloudinaryService: {
    uploadImage(file: Express.Multer.File): Promise<string | null>;
    uploadFromUrl(url: string): Promise<string | null>;
    deleteImage(publicId: string): Promise<boolean>;
};
//# sourceMappingURL=cloudinary.service.d.ts.map