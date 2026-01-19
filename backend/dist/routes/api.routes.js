"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_js_1 = require("../controllers/payment.controller.js");
const ticket_controller_js_1 = require("../controllers/ticket.controller.js");
const admin_controller_js_1 = require("../controllers/admin.controller.js");
const volunteer_controller_js_1 = require("../controllers/volunteer.controller.js");
const pdfUpload_js_1 = __importDefault(require("../utils/pdfUpload.js"));
const router = (0, express_1.Router)();
// Payment & Tickets
router.post('/payment/create-order', payment_controller_js_1.createOrder);
router.post('/payment/verify', payment_controller_js_1.verifyPayment);
router.post('/ticket/generate-and-email', ticket_controller_js_1.generateAndEmail);
router.post('/ticket/download', ticket_controller_js_1.downloadTicket);
router.get('/ticket/pdf-url', ticket_controller_js_1.getSignedPdfUrl);
// Registration with PDF Upload
router.post('/ticket/register', pdfUpload_js_1.default.single('pdf'), ticket_controller_js_1.registerUser);
// Admin
router.post('/admin/login', admin_controller_js_1.adminLogin);
router.get('/admin/registrations', admin_controller_js_1.getRegistrations);
router.get('/admin/sponsorships', admin_controller_js_1.getSponsorships);
router.get('/admin/stats', admin_controller_js_1.getDashboardStats);
router.get('/admin/export', admin_controller_js_1.exportData);
// Volunteer
router.post('/volunteer/check-in', volunteer_controller_js_1.volunteerCheckIn);
exports.default = router;
