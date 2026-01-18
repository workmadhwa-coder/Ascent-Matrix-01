"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportData = exports.getDashboardStats = exports.getSponsorships = exports.getRegistrations = exports.adminLogin = void 0;
const firebase_js_1 = require("../config/firebase.js");
const crypto_1 = __importDefault(require("crypto"));
const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    const envEmail = process.env.ADMIN_EMAIL;
    if (email === envEmail && password === process.env.ADMIN_PASSWORD_RAW) {
        return res.status(200).json({
            status: 'success',
            token: crypto_1.default.randomBytes(32).toString('hex')
        });
    }
    return res.status(401).json({ status: 'failure', message: 'Unauthorized' });
};
exports.adminLogin = adminLogin;
const getRegistrations = async (req, res) => {
    try {
        const snapshot = await firebase_js_1.db.collection('registrations').orderBy('registrationDate', 'desc').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch registrations" });
    }
};
exports.getRegistrations = getRegistrations;
const getSponsorships = async (req, res) => {
    try {
        const snapshot = await firebase_js_1.db.collection('sponsorships').orderBy('date', 'desc').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch sponsorships" });
    }
};
exports.getSponsorships = getSponsorships;
const getDashboardStats = async (req, res) => {
    try {
        const snapshot = await firebase_js_1.db.collection('registrations').get();
        const regs = snapshot.docs.map(doc => doc.data());
        const stats = {
            total: regs.length,
            paid: regs.filter((r) => r.paymentStatus === 'PAID').length,
            pending: regs.filter((r) => r.paymentStatus === 'PENDING').length,
            failed: regs.filter((r) => r.paymentStatus === 'FAILED').length,
            revenue: regs.filter((r) => r.paymentStatus === 'PAID').reduce((acc, r) => acc + (r.totalAmount || 0), 0),
            ticketsIssued: regs.filter((r) => r.paymentStatus === 'PAID').reduce((acc, r) => acc + (r.ticketCount || 0), 0)
        };
        res.status(200).json(stats);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
exports.getDashboardStats = getDashboardStats;
const exportData = async (req, res) => {
    res.status(501).json({ message: 'Use frontend CSV utility for filtered exports' });
};
exports.exportData = exportData;
