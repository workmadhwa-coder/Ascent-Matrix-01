import { Request, Response } from 'express';
import crypto from 'crypto';
import { razorpay } from '../utils/razorpay.js';
import { db } from '../config/firebase.js';

const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount, registrationId } = req.body;
    if (!amount || !registrationId) {
      return res.status(400).json({ error: 'Amount and registrationId are required' });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: registrationId,
    };

    const order = await razorpay.orders.create(options);

    const registrationRef = db.collection('registrations').doc(registrationId);
    await registrationRef.set({
      paymentStatus: 'CREATED',
      orderId: order.id,
      amount,
      updatedAt: new Date(),
    }, { merge: true });

    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('[CREATE ORDER ERROR]', error);
    return res.status(500).json({ error: error.message });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ status: 'failure', message: 'Missing payment details' });
    }

    // Verify Signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', RZP_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ SIGNATURE MISMATCH");
      console.log("Expected:", expectedSignature);
      console.log("Received:", razorpay_signature);
      return res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }

    const registrationRef = db.collection('registrations').doc(registrationId);
    await registrationRef.set({
      paymentStatus: 'PAID',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paidAt: new Date(),
    }, { merge: true });

    return res.status(200).json({ status: 'success', message: 'Payment verified' });
  } catch (error: any) {
    console.error('[VERIFY ERROR]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
