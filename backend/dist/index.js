"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// 🔥 Initialize Firebase ONCE
require("./config/firebase.js");
const payment_routes_js_1 = __importDefault(require("./routes/payment.routes.js"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logger
app.use((req, _res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});
// Routes
app.use('/api', payment_routes_js_1.default);
// Health
app.get('/', (_req, res) => {
    res.json({
        status: 'online',
        message: 'Ascent Matrix Secure API is active',
        port: PORT
    });
});
app.listen(PORT, () => {
    console.log('--------------------------------------------------');
    console.log(`🚀 API running on port ${PORT}`);
    console.log(`🔥 Firebase Project: ${JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT).project_id}`);
    console.log(`🔑 Razorpay Mode: ${process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test') ? 'Test' : 'Live'}`);
    console.log('--------------------------------------------------');
});
