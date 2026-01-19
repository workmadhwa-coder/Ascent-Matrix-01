"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_js_1 = __importDefault(require("../config/cloudinary.js"));
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_js_1.default,
    params: async (_req, file) => {
        return {
            folder: 'registrations/pdfs',
            resource_type: 'raw', // ✅ correct for PDFs
            public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`,
        };
    },
});
const fileFilter = (_req, file, cb) => {
    if (file.mimetype === 'application/pdf')
        cb(null, true);
    else
        cb(new Error('Only PDF files are allowed'));
};
const uploadPdf = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
exports.default = uploadPdf;
