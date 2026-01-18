import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import { Buffer } from 'buffer';
import fetch from 'node-fetch';
import { db } from '../config/firebase.js';
import cloudinary from '../config/cloudinary.js';

// ============================================
// GENERATE PDF + SEND EMAIL
// ============================================
export const generateAndEmail = async (req: any, res: any) => {
  const { registrationData, paymentId } = req.body;

  try {
    // -------------------------------
    // 1. Generate QR Code
    // -------------------------------
    const qrBuffer = await QRCode.toBuffer(registrationData.id, {
      margin: 1,
      width: 220,
    });

    // Fetch logo
    const logoRes = await fetch(
      'https://res.cloudinary.com/dzss2fubc/image/upload/v1767631444/Ascent_Matrix_White_ju8ras.png'
    );
    const logoBuffer = Buffer.from(await logoRes.arrayBuffer());

    // -------------------------------
    // 2. Generate PDF in Memory
    // -------------------------------
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));

    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
    });

    // ===============================
    // PDF DESIGN (DELEGATE PASS)
    // ===============================

    // Header Background
    doc.rect(0, 0, doc.page.width, 140).fill('#0f172a');

    // Logo
    doc.image(logoBuffer, 40, 35, { width: 120 });

    // Title
    doc
      .fillColor('#ffffff')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('ASCENT MATRIX 2026', 200, 40);

    doc
      .fontSize(14)
      .font('Helvetica')
      .fillColor('#cbd5f5')
      .text('OFFICIAL DELEGATE PASS', 200, 78);

    // Divider
    doc
      .moveTo(40, 155)
      .lineTo(doc.page.width - 40, 155)
      .lineWidth(2)
      .strokeColor('#7c3aed')
      .stroke();

    doc.moveDown(3);

    // Card Background
    const cardTop = doc.y;
    doc
      .roundedRect(40, cardTop, doc.page.width - 80, 260, 12)
      .fill('#f8fafc');

    doc.fillColor('#000').fontSize(16).font('Helvetica-Bold');

    doc.text('DELEGATE DETAILS', 60, cardTop + 20);

    doc
      .moveTo(60, cardTop + 45)
      .lineTo(doc.page.width - 60, cardTop + 45)
      .strokeColor('#e5e7eb')
      .stroke();

    doc.fontSize(13).font('Helvetica').fillColor('#111827');

    doc.text(`Name`, 60, cardTop + 65);
    doc.font('Helvetica-Bold').text(registrationData.fullName, 200, cardTop + 65);

    doc.font('Helvetica').text(`Organization`, 60, cardTop + 95);
    doc
      .font('Helvetica-Bold')
      .text(registrationData.organization || '—', 200, cardTop + 95);

    doc.font('Helvetica').text(`Delegate ID`, 60, cardTop + 125);
    doc.font('Helvetica-Bold').text(registrationData.id, 200, cardTop + 125);

    doc.font('Helvetica').text(`Payment ID`, 60, cardTop + 155);
    doc.font('Helvetica-Bold').text(paymentId, 200, cardTop + 155);

    // QR Code Box
    doc
      .roundedRect(doc.page.width - 230, cardTop + 60, 150, 150, 10)
      .fill('#ffffff')
      .strokeColor('#d1d5db')
      .stroke();

    doc.image(qrBuffer, doc.page.width - 215, cardTop + 75, {
      width: 120,
    });

    // Event Details
    doc.moveDown(15);

    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000');
    doc.text('EVENT VENUE', 40);

    doc.moveDown(0.5);
    doc.fontSize(13).font('Helvetica').fillColor('#374151');

    doc.text('Chowdiah Memorial Hall');
    doc.text(
      '16th Cross Rd, Vyalikaval, Kodandarampura,\nMalleshwaram, Bengaluru, Karnataka 560003'
    );

    // Footer
    doc
      .rect(0, doc.page.height - 90, doc.page.width, 90)
      .fill('#0f172a');

    doc
      .fillColor('#e5e7eb')
      .fontSize(10)
      .text(
        'Please carry this delegate pass and a valid photo ID.\nQR code will be scanned at the entry point for verification.',
        40,
        doc.page.height - 65,
        { align: 'center' }
      );

    doc.end();

    const pdfBuffer = await pdfPromise;

    // -------------------------------
    // 3. Setup Nodemailer
    // -------------------------------
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.verify();

    // -------------------------------
    // 4. Send Email
    // -------------------------------
    await transporter.sendMail({
      from: `"Ascent Matrix" <${process.env.MAIL_USER}>`,
      to: registrationData.email,
      subject: 'Your Ascent Matrix 2026 Delegate Pass',
      text: `Hello ${registrationData.fullName},

Thank you for registering for Ascent Matrix 2026.

Your official delegate pass is attached to this email.

Regards,
Ascent Matrix Team`,
      attachments: [
        {
          filename: `Pass_${registrationData.id}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return res.status(200).json({
      status: 'success',
      message: 'Ticket generated and email sent successfully',
    });
  } catch (error) {
    console.error('Ticket & Email Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate or send ticket',
    });
  }
};

// ============================================
// DOWNLOAD PDF ONLY
// ============================================
export const downloadTicket = async (req: any, res: any) => {
  const { registrationData, paymentId } = req.body;

  try {
    const qrBuffer = await QRCode.toBuffer(registrationData.id, {
      margin: 1,
      width: 220,
    });

    const logoRes = await fetch(
      'https://res.cloudinary.com/dzss2fubc/image/upload/v1767631444/Ascent_Matrix_White_ju8ras.png'
    );
    const logoBuffer = Buffer.from(await logoRes.arrayBuffer());

    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Pass_${registrationData.id}.pdf`
    );

    doc.pipe(res);

    // Same UI as above
    doc.rect(0, 0, doc.page.width, 140).fill('#0f172a');
    doc.image(logoBuffer, 40, 35, { width: 120 });

    doc
      .fillColor('#ffffff')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('ASCENT MATRIX 2026', 200, 40);

    doc
      .fontSize(14)
      .font('Helvetica')
      .fillColor('#cbd5f5')
      .text('OFFICIAL DELEGATE PASS', 200, 78);

    doc.moveDown(10);
    doc.image(qrBuffer, (doc.page.width - 220) / 2, doc.y, { width: 220 });

    doc.end();
  } catch (error) {
    console.error('Download Error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
};

// ============================================
// REGISTER USER WITH PDF UPLOAD
// ============================================
export const registerUser = async (req: any, res: any) => {
  try {
    console.log('=== REGISTRATION REQUEST ===');
    console.log('Files received:', req.file);
    console.log('Body received:', JSON.stringify(req.body, null, 2));

    // Validate PDF upload
    if (!req.file) {
      console.error('❌ ERROR: No PDF file uploaded');
      return res.status(400).json({
        status: 'error',
        message: 'PDF file is required',
      });
    }

    console.log('✓ PDF file received:', req.file.originalname, 'Size:', req.file.size);

    // Extract registration data from form
    const {
      fullName,
      gender,
      phone,
      email,
      city,
      state,
      organization,
      designation,
      orgType,
      orgTypeOther,
      domains,
      domainsOther,
      ecosystemRole,
      purposes,
      qucInterest,
      stallType,
      stallPrice,
      ticketCount,
      totalAmount,
      paymentId,
      ticketType,
      problemStatement,
      solution,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      console.error('❌ Missing required fields - fullName:', fullName, 'email:', email, 'phone:', phone);
      return res.status(400).json({
        status: 'error',
        message: 'Full name, email, and phone are required',
      });
    }

    // Get Cloudinary upload data from uploaded file
    console.log('📁 File object keys:', Object.keys(req.file));
    console.log('📁 File object:', req.file);
    
    const pdfPublicId = req.file?.public_id || req.file?.filename || null;
    const pdfUrl = req.file.path;

    console.log('✓ Cloudinary Public ID:', pdfPublicId);
    console.log('✓ Cloudinary URL:', pdfUrl);

    // Generate registration ID
    const registrationId = `AM26-${Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')}`;

    console.log('✓ Generated ID:', registrationId);

    // Prepare registration data
    let parsedDomains = [];
    let parsedPurposes = [];

    try {
      if (domains) {
        parsedDomains = typeof domains === 'string' ? JSON.parse(domains) : domains;
      }
    } catch (e) {
      console.warn('⚠️ Failed to parse domains:', e);
      parsedDomains = [];
    }

    try {
      if (purposes) {
        parsedPurposes = typeof purposes === 'string' ? JSON.parse(purposes) : purposes;
      }
    } catch (e) {
      console.warn('⚠️ Failed to parse purposes:', e);
      parsedPurposes = [];
    }

    console.log('✓ Registration data prepared:', {
      id: registrationId,
      fullName,
      email,
      phone,
      ticketType,
      stallType,
      totalAmount,
      problemStatement: problemStatement ? 'provided' : 'not provided',
    });

    // Create registration data object
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
      domains: parsedDomains,
      domainsOther: domainsOther || '',
      ecosystemRole: ecosystemRole || '',
      purposes: parsedPurposes,
      qucInterest: qucInterest || '',
      stallType: stallType || '',
      stallPrice: stallPrice || 0,
      ticketCount: ticketCount || 1,
      totalAmount: Number(totalAmount) || 0,
      paymentId: paymentId || '',
      ticketType: ticketType || '',
      problemStatement: problemStatement || '',
      solution: solution || '',
      pdfUrl: pdfUrl,
      paymentStatus: 'PENDING',
      createdAt: new Date(),
    };

    // Only add pdfPublicId if it exists (avoid undefined values in Firestore)
    if (pdfPublicId) {
      registrationData.pdfPublicId = pdfPublicId;
    }

    // Save to Firestore
    await db.collection('registrations').doc(registrationId).set(registrationData);

    console.log('✅ Registration saved successfully to Firestore:', registrationId);

    return res.status(201).json({
      status: 'success',
      message: 'Registration saved successfully',
      data: {
        id: registrationId,
        email: email,
        pdfUrl: pdfUrl,
      },
    });
  } catch (error) {
    console.error('❌ REGISTRATION ERROR:');
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    } else {
      console.error('   Error Object:', JSON.stringify(error, null, 2));
    }

    return res.status(500).json({
      status: 'error',
      message: 'Failed to register user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================
// GET SIGNED PDF URL
// ============================================
export const getSignedPdfUrl = async (req: any, res: any) => {
  try {
    const { publicId } = req.query;

    if (!publicId) {
      return res.status(400).json({
        status: 'error',
        message: 'publicId is required',
      });
    }

    // Generate signed URL valid for 10 minutes
    const signedUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
      expires_at: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
    });

    console.log('✓ Signed PDF URL generated for:', publicId);

    return res.status(200).json({
      status: 'success',
      url: signedUrl,
    });
  } catch (error) {
    console.error('❌ SIGNED URL ERROR:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate signed PDF URL',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
