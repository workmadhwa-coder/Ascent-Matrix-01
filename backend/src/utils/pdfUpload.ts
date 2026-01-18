import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    return {
      folder: 'registrations/pdfs',
      resource_type: 'raw',   // ✅ correct for PDFs
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`,
    };
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'));
};

const uploadPdf = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default uploadPdf;
