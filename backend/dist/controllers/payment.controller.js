"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createOrder = void 0;
const razorpay_js_1 = require("../utils/razorpay.js");
const crypto_1 = __importDefault(require("crypto"));
const firebase_js_1 = require("../config/firebase.js");
const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
// =======================
// CREATE ORDER
// =======================
const createOrder = async (req, res) => {
    try {
        const { amount, registrationId } = req.body;
        if (!amount || typeof amount !== 'number') {
            return res.status(400).json({
                error: 'Amount is required and must be a number'
            });
        }
        if (!registrationId) {
            return res.status(400).json({
                error: 'registrationId is required'
            });
        }
        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: registrationId,
        };
        const order = await razorpay_js_1.razorpay.orders.create(options);
        // ✅ Ensure registration doc exists
        await firebase_js_1.db.collection('registrations').doc(registrationId).set({
            paymentStatus: 'CREATED',
            orderId: order.id,
            amount,
            currency: 'INR',
            createdAt: new Date(),
        }, { merge: true });
        return res.status(200).json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: RZP_KEY_ID,
        });
    }
    catch (error) {
        console.error('[ORDER] Error:', error);
        return res.status(500).json({
            message: 'Order creation failed',
            error: error.message,
        });
    }
};
exports.createOrder = createOrder;
// =======================
// VERIFY PAYMENT
// =======================
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId, } = req.body;
    try {
        if (!registrationId) {
            return res.status(400).json({
                error: 'registrationId is required',
            });
        }
        if (!RZP_KEY_SECRET) {
            throw new Error('Razorpay Secret Key is missing');
        }
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', RZP_KEY_SECRET)
            .update(body)
            .digest('hex');
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                status: 'failure',
                message: 'Invalid signature',
            });
        }
        const ref = firebase_js_1.db.collection('registrations').doc(registrationId);
        const snap = await ref.get();
        // 🔁 Idempotency protection
        if (snap.exists && snap.data()?.paymentStatus === 'PAID') {
            return res.status(200).json({
                status: 'success',
                message: 'Payment already verified',
            });
        }
        // ✅ Create OR update safely
        await ref.set({
            paymentStatus: 'PAID',
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            paidAt: new Date(),
        }, { merge: true });
        return res.status(200).json({ status: 'success' });
    }
    catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({
            error: 'Verification failed',
            message: error.message,
        });
    }
};
exports.verifyPayment = verifyPayment;
