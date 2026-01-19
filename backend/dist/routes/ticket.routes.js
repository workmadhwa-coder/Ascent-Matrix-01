"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticket_controller_js_1 = require("../controllers/ticket.controller.js");
const pdfUpload_js_1 = __importDefault(require("../utils/pdfUpload.js"));
const router = (0, express_1.Router)();
// Ticket Routes
router.post('/ticket/generate-and-email', ticket_controller_js_1.generateAndEmail);
router.post('/ticket/download', ticket_controller_js_1.downloadTicket);
// Registration with PDF Upload
router.post('/ticket/register', pdfUpload_js_1.default.single('pdf'), ticket_controller_js_1.registerUser);
exports.default = router;
