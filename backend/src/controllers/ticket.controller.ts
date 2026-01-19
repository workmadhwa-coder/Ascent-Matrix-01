import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fetch from 'node-fetch';
import { Buffer } from 'buffer';
import { Resend } from 'resend';
import { db } from '../config/firebase.js';
import cloudinary from '../config/cloudinary.js';

// ============================================
// RESEND INITIALIZATION
// ============================================

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is missing');
}

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// GENERATE PDF + SEND EMAIL
// ============================================

export const generateAndEmail = async (req: any, res: any) => {
  try {
    const { registrationData, paymentId } = req.body;

    const qrBuffer = await QRCode.toBuffer(registrationData.id, { width: 220 });
    const logoRes = await fetch(
      'https://res.cloudinary.com/dzss2fubc/image/upload/v1767631444/Ascent_Matrix_White_ju8ras.png'
    );
    const logoBuffer = Buffer.from(await logoRes.arrayBuffer());

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers: Buffer[] = [];

    doc.on('data', (b) => buffers.push(b));
    const pdfPromise = new Promise<Buffer>((resolve) =>
      doc.on('end', () => resolve(Buffer.concat(buffers)))
    );

    doc.rect(0, 0, doc.page.width, 140).fill('#0f172a');
    doc.image(logoBuffer, 40, 35, { width: 120 });

    doc.fillColor('#fff')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('ASCENT MATRIX 2026', 200, 40);

    doc.fontSize(14)
      .font('Helvetica')
      .fillColor('#cbd5f5')
      .text('OFFICIAL DELEGATE PASS', 200, 78);

    doc.image(qrBuffer, doc.page.width - 215, 230, { width: 120 });
    doc.end();

    const pdfBuffer = await pdfPromise;

    await resend.emails.send({
      from: 'Ascent Matrix <noreply@ascentmtrix.com>',
      to: registrationData.email,
      subject: 'Your Ascent Matrix 2026 Delegate Pass 🎫',
      html: `<p>Hello ${registrationData.fullName}, your ticket is attached.</p>`,
      attachments: [
        {
          filename: `Pass_${registrationData.id}.pdf`,
          content: pdfBuffer.toString('base64'),
          contentType: 'application/pdf'
        }
      ]
    });

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Email failed' });
  }
};

// ============================================
// DOWNLOAD PDF
// ============================================

export const downloadTicket = async (req: any, res: any) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);
  doc.text('Ticket');
  doc.end();
};

// ============================================
// REGISTER USER (RESTORED EXPORT)
// ============================================

export const registerUser = async (req: any, res: any) => {
  try {
    const { registrationId, email } = req.body;

    await db.collection('registrations').doc(registrationId).set({
      email,
      createdAt: new Date()
    });

    res.status(201).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// ============================================
// SIGNED PDF URL (RESTORED EXPORT)
// ============================================

export const getSignedPdfUrl = async (req: any, res: any) => {
  const { publicId } = req.query;

  const url = cloudinary.utils.private_download_url(publicId, 'pdf', {
    expires_at: Math.floor(Date.now() / 1000) + 600
  });

  res.json({ url });
};
