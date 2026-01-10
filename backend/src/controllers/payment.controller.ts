import { razorpay } from '../utils/razorpay.js';
import crypto from 'crypto';
import { db } from '../config/firebase.js';

const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// =======================
// CREATE ORDER
// =======================
export const createOrder = async (req: any, res: any) => {
  try {
    const { amount, registrationId } = req.body;

    if (!amount || typeof amount !== 'number') {
      return res
        .status(400)
        .json({ error: 'Amount is required and must be a number' });
    }

    if (!registrationId) {
      return res
        .status(400)
        .json({ error: 'registrationId is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: registrationId,
    };

    const order = await razorpay.orders.create(options);

    // 🔹 Create / update registration record safely
    await db
      .collection('registrations')
      .doc(registrationId)
      .set(
        {
          paymentStatus: 'CREATED',
          orderId: order.id,
          amount,
          currency: 'INR',
          createdAt: new Date(),
        },
        { merge: true }
      );

    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: RZP_KEY_ID,
    });
  } catch (error: any) {
    console.error('[ORDER] Error:', error);
    return res.status(500).json({
      message: 'Order creation failed',
      error: error.message,
    });
  }
};

// =======================
// VERIFY PAYMENT
// =======================
export const verifyPayment = async (req: any, res: any) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    registrationId,
  } = req.body;

  try {
    if (!registrationId) {
      return res
        .status(400)
        .json({ error: 'registrationId is required' });
    }

    if (!RZP_KEY_SECRET) {
      throw new Error('Razorpay Secret Key is missing in environment');
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', RZP_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ status: 'failure', message: 'Invalid signature' });
    }

    const registrationRef = db
      .collection('registrations')
      .doc(registrationId);

    const snapshot = await registrationRef.get();

    // 🔁 Idempotency check (avoid double processing)
    if (snapshot.exists && snapshot.data()?.paymentStatus === 'PAID') {
      return res.status(200).json({
        status: 'success',
        message: 'Payment already verified',
      });
    }

    // ✅ Create OR update safely
    await registrationRef.set(
      {
        paymentStatus: 'PAID',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        paidAt: new Date(),
      },
      { merge: true }
    );

    return res.status(200).json({ status: 'success' });
  } catch (error: any) {
    console.error('Verification error:', error);
    return res.status(500).json({
      error: 'Verification failed',
      message: error.message,
    });
  }
};
