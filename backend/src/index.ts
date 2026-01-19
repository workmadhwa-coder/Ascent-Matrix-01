
import dotenv from 'dotenv';
dotenv.config();
import 'dotenv/config'; // MUST be first


import express from 'express';
import cors from 'cors';


// 🔥 Initialize Firebase ONCE
import './config/firebase.js';

// Initialize Cloudinary config
import './config/cloudinary.js';

import apiRoutes from './routes/api.routes.js';

// 🔥 IMPORTANT: Initialize Firebase ONCE at startup
import './config/firebase.js';

import paymentRoutes from './routes/payment.routes.js';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*', // In production, restrict this
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json() as any);
app.use(express.urlencoded({ extended: true }) as any);

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', apiRoutes);
app.use('/api', paymentRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Ascent Matrix Secure API is active',
    port: PORT
  });
});

app.listen(PORT, () => {
  console.log('--------------------------------------------------');

  console.log(`🚀 API running on port ${PORT}`);

  console.log(`🚀 Ascent Matrix API: http://localhost:${PORT}`);

  console.log(
    `🔥 Firebase Project: ${
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!).project_id
    }`
  );
  console.log(
    `🔑 Razorpay Mode: ${
      process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test') ? 'Test' : 'Live'
    }`
  );
  console.log('--------------------------------------------------');
});
