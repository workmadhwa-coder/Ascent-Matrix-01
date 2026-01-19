import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// FORCE CommonJS (v4 export)
const { CloudinaryStorage } = require('multer-storage-cloudinary');

/* --------------------------------------------------
   Storage for PDF Uploads
-------------------------------------------------- */
const storage = new CloudinaryStorage({
  cloudinary,
  params: (_req: any, file: Express.Multer.File) => ({
    folder: 'registrations/pdfs',
    resource_type: 'raw', // REQUIRED for PDFs
    public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`,
  }),
});

/* --------------------------------------------------
   File Filter
-------------------------------------------------- */
const fileFilter: multer.Options['fileFilter'] = (
  _req,
  file,
  cb
) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

/* --------------------------------------------------
   Multer Middleware
-------------------------------------------------- */
const uploadPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default uploadPdf;
