// MUST be first
import 'dotenv/config';

import express from 'express';
import cors from 'cors';

// ✅ Initialize Firebase ONCE
import './config/firebase.js';

// ✅ Initialize Cloudinary ONCE
import './config/cloudinary.js';

import apiRoutes from './routes/api.routes.js';
import paymentRoutes from './routes/payment.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Correct CORS for Render
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      process.env.FRONTEND_URL || ''
    ],
    methods: ['GET', 'POST'],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', apiRoutes);
app.use('/api', paymentRoutes);

// Health Check (Render friendly)
app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    message: 'Ascent Matrix Secure API is active'
  });
});

app.listen(PORT, () => {
  console.log('--------------------------------------------------');
  console.log(`🚀 API running on port ${PORT}`);
  console.log(
    `🔑 Razorpay Mode: ${
      process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test') ? 'Test' : 'Live'
    }`
  );
  console.log('--------------------------------------------------');
});
