import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';

// Initialize Configs
import './config/firebase.js';
import './config/cloudinary.js';

// Import Routes
import apiRoutes from './routes/api.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes - apiRoutes already contains paymentRoutes, so we only need this one
app.use('/api', apiRoutes);

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
  
  const isTestMode = process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test');
  console.log(`🔑 Razorpay Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);
  console.log('--------------------------------------------------');
});
