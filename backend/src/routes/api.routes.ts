import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';
import { generateAndEmail, downloadTicket, registerUser, getSignedPdfUrl } from '../controllers/ticket.controller.js';
import { adminLogin, getDashboardStats, exportData, getRegistrations, getSponsorships } from '../controllers/admin.controller.js';
import { volunteerCheckIn } from '../controllers/volunteer.controller.js';
import uploadPdf from '../utils/pdfUpload.js';

const router = Router();

// Payment & Tickets
router.post('/payment/create-order', createOrder);
router.post('/payment/verify', verifyPayment);
router.post('/ticket/generate-and-email', generateAndEmail);
router.post('/ticket/download', downloadTicket);
router.get('/ticket/pdf-url', getSignedPdfUrl);

// Registration with PDF Upload
router.post('/ticket/register', uploadPdf.single('pdf'), registerUser);

// Admin
router.post('/admin/login', adminLogin);
router.get('/admin/registrations', getRegistrations);
router.get('/admin/sponsorships', getSponsorships);
router.get('/admin/stats', getDashboardStats);
router.get('/admin/export', exportData);

// Volunteer
router.post('/volunteer/check-in', volunteerCheckIn);

export default router;
