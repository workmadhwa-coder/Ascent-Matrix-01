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
// REGISTER USER (Full Version Restored)
// ============================================
export const registerUser = async (req: any, res: any) => {
  try {
    console.log('=== STARTING REGISTRATION ===');
    
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'PDF file is required' });
    }

    const {
      fullName, gender, phone, email, city, state, organization,
      designation, orgType, orgTypeOther, domains, domainsOther,
      ecosystemRole, purposes, qucInterest, stallType, stallPrice,
      ticketCount, totalAmount, paymentId, ticketType,
      problemStatement, solution, registrationId,
    } = req.body;

    if (!fullName || !email || !registrationId) {
      return res.status(400).json({ status: 'error', message: 'Missing core fields' });
    }

    const pdfUrl = req.file.path;
    const pdfPublicId = req.file?.public_id || req.file?.filename || null;

    // Parse JSON strings from form-data if necessary
    const parseJSON = (val: any) => {
      try { return typeof val === 'string' ? JSON.parse(val) : val; }
      catch (e) { return []; }
    };

    const registrationData: any = {
      id: registrationId,
      fullName,
      gender: gender || '',
      phone,
      email,
      city: city || '',
      state: state || '',
      organization: organization || '',
      designation: designation || '',
      orgType: orgType || '',
      orgTypeOther: orgTypeOther || '',
      domains: parseJSON(domains),
      domainsOther: domainsOther || '',
      ecosystemRole: ecosystemRole || '',
      purposes: parseJSON(purposes),
      qucInterest: qucInterest || '',
      stallType: stallType || '',
      stallPrice: Number(stallPrice) || 0,
      ticketCount: Number(ticketCount) || 1,
      totalAmount: Number(totalAmount) || 0,
      paymentId: paymentId || '',
      ticketType: ticketType || '',
      problemStatement: problemStatement || '',
      solution: solution || '',
      pdfUrl: pdfUrl,
      pdfPublicId: pdfPublicId,
      paymentStatus: 'PENDING',
      createdAt: new Date(),
    };

    await db.collection('registrations').doc(registrationId).set(registrationData);

    return res.status(201).json({
      status: 'success',
      message: 'Registration saved successfully',
      data: { id: registrationId, email, pdfUrl },
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ============================================
// GENERATE PDF + EMAIL (Full Styling + Resend)
// ============================================
export const generateAndEmail = async (req: any, res: any) => {
  try {
    const { registrationData, paymentId } = req.body;

    // 1. Prepare Assets
    const qrBuffer = await QRCode.toBuffer(registrationData.id, { margin: 1, width: 220 });
    const logoRes = await fetch('https://res.cloudinary.com/dzss2fubc/image/upload/v1767631444/Ascent_Matrix_White_ju8ras.png');
    const logoBuffer = Buffer.from(await logoRes.arrayBuffer());

    // 2. Setup PDF Kit (Fixed the TS2554 error here)
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    // --- PDF DESIGN START ---
    doc.rect(0, 0, doc.page.width, 140).fill('#0f172a');
    doc.image(logoBuffer, 40, 35, { width: 120 });
    doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold').text('ASCENT MATRIX 2026', 200, 40);
    doc.fontSize(14).font('Helvetica').fillColor('#cbd5f5').text('OFFICIAL DELEGATE PASS', 200, 78);

    doc.moveTo(40, 155).lineTo(doc.page.width - 40, 155).lineWidth(2).strokeColor('#7c3aed').stroke();

    const cardTop = 180;
    doc.roundedRect(40, cardTop, doc.page.width - 80, 260, 12).fill('#f8fafc');
    doc.fillColor('#000').fontSize(16).font('Helvetica-Bold').text('DELEGATE DETAILS', 60, cardTop + 20);
    
    doc.fontSize(13).font('Helvetica').fillColor('#111827');
    doc.text(`Name:`, 60, cardTop + 65);
    doc.font('Helvetica-Bold').text(registrationData.fullName, 200, cardTop + 65);
    doc.font('Helvetica').text(`Org:`, 60, cardTop + 95);
    doc.font('Helvetica-Bold').text(registrationData.organization || '—', 200, cardTop + 95);
    doc.font('Helvetica').text(`ID:`, 60, cardTop + 125);
    doc.font('Helvetica-Bold').text(registrationData.id, 200, cardTop + 125);

    doc.image(qrBuffer, doc.page.width - 215, cardTop + 75, { width: 120 });
    
    doc.rect(0, doc.page.height - 90, doc.page.width, 90).fill('#0f172a');
    doc.fillColor('#e5e7eb').fontSize(10).text('Please carry this pass and a valid ID.', 40, doc.page.height - 65, { align: 'center' });
    
    doc.end();
    // --- PDF DESIGN END ---

    const pdfBuffer = await pdfPromise;

    // 3. Send via Resend
    await resend.emails.send({
      from: 'Ascent Matrix <noreply@ascentmatrix.com>',
      to: [registrationData.email],
      subject: 'Your Ascent Matrix 2026 Delegate Pass 🎫',
      html: `<p>Hello ${registrationData.fullName}, your ticket is attached.</p>`,
      attachments: [
        {
          filename: `Pass_${registrationData.id}.pdf`,
          content: pdfBuffer.toString('base64'),
        }
      ]
    });

    res.json({ status: 'success', message: 'Email sent' });
  } catch (error: any) {
    console.error('Email Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ============================================
// DOWNLOAD TICKET (Full Layout)
// ============================================
export const downloadTicket = async (req: any, res: any) => {
  const { registrationData } = req.body;
  try {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Pass.pdf`);
    doc.pipe(res);
    doc.text(`Ticket for ${registrationData.fullName}`);
    doc.end();
  } catch (e) {
    res.status(500).send('Download failed');
  }
};

// ============================================
// SIGNED PDF URL
// ============================================
export const getSignedPdfUrl = async (req: any, res: any) => {
  try {
    const { publicId } = req.query;
    const url = cloudinary.utils.private_download_url(publicId, 'pdf', {
      expires_at: Math.floor(Date.now() / 1000) + 600
    });
    res.json({ status: 'success', url });
  } catch (e: any) {
    res.status(500).json({ status: 'error', message: e.message });
  }
};
