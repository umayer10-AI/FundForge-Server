"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
cloudinary_1.v2.config({
    cloud_name: config_1.config.cloudinary.cloudName,
    api_key: config_1.config.cloudinary.apiKey,
    api_secret: config_1.config.cloudinary.apiSecret,
});
exports.cloudinaryService = {
    async uploadImage(file) {
        try {
            const base64 = file.buffer.toString('base64');
            const dataUri = `data:${file.mimetype};base64,${base64}`;
            const result = await cloudinary_1.v2.uploader.upload(dataUri, {
                folder: 'fundforge',
                resource_type: 'image',
                transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            });
            return result.secure_url;
        }
        catch (error) {
            logger_1.logger.error('Cloudinary upload error:', error);
            return null;
        }
    },
    async uploadFromUrl(url) {
        try {
            const result = await cloudinary_1.v2.uploader.upload(url, {
                folder: 'fundforge',
                resource_type: 'image',
                transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            });
            return result.secure_url;
        }
        catch (error) {
            logger_1.logger.error('Cloudinary upload from URL error:', error);
            return null;
        }
    },
    async deleteImage(publicId) {
        try {
            await cloudinary_1.v2.uploader.destroy(publicId);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Cloudinary delete error:', error);
            return false;
        }
    },
};
//# sourceMappingURL=cloudinary.service.js.map