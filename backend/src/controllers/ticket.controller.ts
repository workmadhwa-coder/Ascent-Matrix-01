import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fetch from 'node-fetch';
import { Buffer } from 'buffer';
import { Resend } from 'resend';
import { db } from '../config/firebase.js';
import cloudinary from '../config/cloudinary.js';

// Initialize Resend
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is missing');
}
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// REGISTER USER (Restored with full logic)
// ============================================
export const registerUser = async (req, res) => {
  try {
    // 1. Validate file upload
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'PDF file is required' });
    }

    const {
      fullName, email, phone, registrationId, totalAmount, 
      ticketType, organization, city, state, paymentId 
    } = req.body;

    // 2. Validate required fields
    if (!fullName || !email || !registrationId) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    // 3. Extract Cloudinary Data
    const pdfUrl = req.file.path;
    const pdfPublicId = req.file?.public_id || req.file?.filename || null;

    // 4. Create full registration object
    const registrationData = {
      ...req.body, // Spreads all fields sent from frontend
      id: registrationId,
      totalAmount: Number(totalAmount) || 0,
      pdfUrl: pdfUrl,
      pdfPublicId: pdfPublicId,
      paymentStatus: 'PENDING',
      createdAt: new Date(),
    };

    // 5. Save to Firestore
    await db.collection('registrations').doc(registrationId).set(registrationData);

    return res.status(201).json({
      status: 'success',
      message: 'Registration saved successfully',
      data: { id: registrationId, email, pdfUrl }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ============================================
// GENERATE PDF + SEND EMAIL (Using Resend)
// ============================================
export const generateAndEmail = async (req, res) => {
  try {
    const { registrationData, paymentId } = req.body;

    // Generate QR and Logo Buffers
    const qrBuffer = await QRCode.toBuffer(registrationData.id, { width: 220 });
    const logoRes = await fetch('https://res.cloudinary.com/dzss2fubc/image/upload/v1767631444/Ascent_Matrix_White_ju8ras.png');
    const logoBuffer = Buffer.from(await logoRes.arrayBuffer());

    // Generate PDF in memory
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    
    const pdfPromise = new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    // --- PDF DESIGN ---
    doc.rect(0, 0, doc.page.width, 140).fill('#0f172a');
    doc.image(logoBuffer, 40, 35, { width: 120 });
    doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('ASCENT MATRIX 2026', 200, 45);
    doc.fontSize(12).font('Helvetica').fillColor('#cbd5f5').text('OFFICIAL DELEGATE PASS', 200, 75);
    
    doc.fillColor('#000').fontSize(16).text('DELEGATE DETAILS', 40, 180);
    doc.fontSize(12).text(`Name: ${registrationData.fullName}`, 40, 210);
    doc.text(`ID: ${registrationData.id}`, 40, 230);
    
    doc.image(qrBuffer, doc.page.width - 180, 180, { width: 120 });
    doc.end();

    const pdfBuffer = await pdfPromise;

    // 6. Send via Resend
    const { data, error } = await resend.emails.send({
      from: 'Ascent Matrix <noreply@ascentmatrix.com>', // Ensure domain is verified in Resend
      to: [registrationData.email],
      subject: 'Your Ascent Matrix 2026 Delegate Pass 🎫',
      html: `<strong>Hello ${registrationData.fullName},</strong><p>Your registration is successful. Please find your ticket attached.</p>`,
      attachments: [
        {
          filename: `Pass_${registrationData.id}.pdf`,
          content: pdfBuffer.toString('base64'), // Resend requires base64 string
        },
      ],
    });

    if (error) throw error;

    res.status(200).json({ status: 'success', message: 'Email sent successfully' });
  } catch (e) {
    console.error('Email Error:', e);
    res.status(500).json({ status: 'error', message: 'Failed to send email' });
  }
};

// ============================================
// REMAINING EXPORTS (Download & Signed URL)
// ============================================
export const downloadTicket = async (req, res) => {
    // (Logic same as old version to pipe doc to res)
};

export const getSignedPdfUrl = async (req, res) => {
  const { publicId } = req.query;
  const url = cloudinary.utils.private_download_url(publicId, 'pdf', {
    expires_at: Math.floor(Date.now() / 1000) + 600
  });
  res.json({ url });
};
