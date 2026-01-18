import { Router } from 'express';
import { generateAndEmail, downloadTicket, registerUser } from '../controllers/ticket.controller.js';
import uploadPdf from '../utils/pdfUpload.js';

const router = Router();

// Ticket Routes
router.post('/ticket/generate-and-email', generateAndEmail);
router.post('/ticket/download', downloadTicket);

// Registration with PDF Upload
router.post('/ticket/register', uploadPdf.single('pdf'), registerUser);

export default router;
