"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_js_1 = require("../controllers/payment.controller.js");
const ticket_controller_js_1 = require("../controllers/ticket.controller.js");
const admin_controller_js_1 = require("../controllers/admin.controller.js");
const volunteer_controller_js_1 = require("../controllers/volunteer.controller.js");
const router = (0, express_1.Router)();
// Payment & Tickets
router.post('/payment/create-order', payment_controller_js_1.createOrder);
router.post('/payment/verify', payment_controller_js_1.verifyPayment);
router.post('/ticket/generate-and-email', ticket_controller_js_1.generateAndEmail);
router.post('/ticket/download', ticket_controller_js_1.downloadTicket);
// Admin
router.post('/admin/login', admin_controller_js_1.adminLogin);
router.get('/admin/registrations', admin_controller_js_1.getRegistrations);
router.get('/admin/sponsorships', admin_controller_js_1.getSponsorships);
router.get('/admin/stats', admin_controller_js_1.getDashboardStats);
router.get('/admin/export', admin_controller_js_1.exportData);
// Volunteer
router.post('/volunteer/check-in', volunteer_controller_js_1.volunteerCheckIn);
exports.default = router;
