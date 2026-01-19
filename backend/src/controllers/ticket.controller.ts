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
// REGISTER USER (Conditional PDF & Ideathon Logic)
// ============================================
export const registerUser = async (req: any, res: any) => {
  try {
    console.log('=== STARTING REGISTRATION ===');

    const {
      fullName, gender, phone, email, city, state, organization,
      designation, orgType, orgTypeOther, domains, domainsOther,
      ecosystemRole, purposes, qucInterest, stallType, stallPrice,
      ticketCount, totalAmount, paymentId, ticketType,
      problemStatement, solution, registrationId,
    } = req.body;

    // 1. DETERMINE TICKET CATEGORY
    const isIdeathon = ticketType?.toLowerCase().includes('ideathon');

    // 2. CONDITIONAL VALIDATION
    // If it's Ideathon, we MUST have a file. If not, it's optional.
    if (isIdeathon && !req.file) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Ideathon participation requires a PDF proposal upload.' 
      });
    }

    // Basic core field validation
    if (!fullName || !email || !registrationId) {
      return res.status(400).json({ status: 'error', message: 'Missing core fields' });
    }

    // 3. FILE DATA HANDLING
    // If no file exists (Normal 999 event), these will be null
    const pdfUrl = req.file ? req.file.path : null;
    const pdfPublicId = req.file?.public_id || req.file?.filename || null;

    // Parse JSON strings from form-data
    const parseJSON = (val: any) => {
      try { return typeof val === 'string' ? JSON.parse(val) : val; }
      catch (e) { return []; }
    };

    // 4. PREPARE DATA FOR FIRESTORE
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
      // Only store these if it's an Ideathon ticket, otherwise keep empty
      problemStatement: isIdeathon ? (problemStatement || '') : '',
      solution: isIdeathon ? (solution || '') : '',
      pdfUrl: pdfUrl,
      pdfPublicId: pdfPublicId,
      paymentStatus: 'PENDING',
      createdAt: new Date(),
    };

    // 5. SAVE TO DATABASE
    await db.collection('registrations').doc(registrationId).set(registrationData);

    console.log(`✅ ${isIdeathon ? 'Ideathon' : 'Summit Pass'} Registration saved successfully`);

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
// GENERATE PDF + EMAIL
// ============================================
export const generateAndEmail = async (req: any, res: any) => {
  try {
    const { registrationData, paymentId } = req.body;

    const qrBuffer = await QRCode.toBuffer(registrationData.id, { margin: 1, width: 220 });
    const logoRes = await fetch('https://res.cloudinary.com/dzss2fubc/image/upload/v1767631444/Ascent_Matrix_White_ju8ras.png');
    const logoBuffer = Buffer.from(await logoRes.arrayBuffer());

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    // Design Header
    doc.rect(0, 0, doc.page.width, 140).fill('#0f172a');
    doc.image(logoBuffer, 40, 35, { width: 120 });
    doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('ASCENT MATRIX 2026', 200, 45);
    doc.fontSize(12).font('Helvetica').fillColor('#cbd5f5').text('OFFICIAL DELEGATE PASS', 200, 75);

    doc.moveTo(40, 155).lineTo(doc.page.width - 40, 155).lineWidth(2).strokeColor('#7c3aed').stroke();

    const cardTop = 180;
    doc.roundedRect(40, cardTop, doc.page.width - 80, 260, 12).fill('#f8fafc');
    doc.fillColor('#000').fontSize(16).font('Helvetica-Bold').text('DELEGATE DETAILS', 60, cardTop + 20);
    
    doc.fontSize(13).font('Helvetica').fillColor('#111827');
    doc.text(`Name:`, 60, cardTop + 65);
    doc.font('Helvetica-Bold').text(registrationData.fullName, 200, cardTop + 65);
    doc.font('Helvetica').text(`Org:`, 60, cardTop + 95);
    doc.font('Helvetica-Bold').text(registrationData.organization || '—', 200, cardTop + 95);
    doc.font('Helvetica').text(`Ticket:`, 60, cardTop + 125);
    doc.font('Helvetica-Bold').text(registrationData.ticketType || 'General', 200, cardTop + 125);
    doc.font('Helvetica').text(`ID:`, 60, cardTop + 155);
    doc.font('Helvetica-Bold').text(registrationData.id, 200, cardTop + 155);

    doc.image(qrBuffer, doc.page.width - 215, cardTop + 75, { width: 120 });
    
    doc.rect(0, doc.page.height - 80, doc.page.width, 80).fill('#0f172a');
    doc.fillColor('#e5e7eb').fontSize(10).text('Please carry this pass and a valid ID. Event Venue: Chowdiah Memorial Hall, Bengaluru.', 40, doc.page.height - 50, { align: 'center' });
    
    doc.end();

    const pdfBuffer = await pdfPromise;

    await resend.emails.send({
      from: 'Ascent Matrix <noreply@ascentmatrix.com>', // Ensure your domain is verified on Resend
      to: [registrationData.email],
      subject: 'Your Ascent Matrix 2026 Delegate Pass 🎫',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Hello ${registrationData.fullName},</h2>
          <p>Thank you for registering for <b>Ascent Matrix 2026</b>.</p>
          <p>Your official delegate pass has been generated and is attached to this email as a PDF.</p>
          <p>Please present the QR code at the registration desk for entry.</p>
          <br/>
          <p>Best Regards,<br/>Team Ascent Matrix</p>
        </div>
      `,
      attachments: [
        {
          filename: `Pass_${registrationData.id}.pdf`,
          content: pdfBuffer.toString('base64'),
        }
      ]
    });

    res.json({ status: 'success', message: 'Ticket generated and email sent' });
  } catch (error: any) {
    console.error('Email Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ============================================
// DOWNLOAD TICKET (Full Layout Pipeline)
// ============================================
export const downloadTicket = async (req: any, res: any) => {
  const { registrationData } = req.body;
  try {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Pass_${registrationData.id}.pdf`);
    
    doc.pipe(res);
    doc.fontSize(20).text(`Ascent Matrix 2026 - Delegate Pass`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Name: ${registrationData.fullName}`);
    doc.text(`ID: ${registrationData.id}`);
    doc.text(`Ticket: ${registrationData.ticketType}`);
    doc.end();
  } catch (e) {
    res.status(500).send('Download failed');
  }
};

// ============================================
// SIGNED PDF URL (For Admin Panel)
// ============================================
export const getSignedPdfUrl = async (req: any, res: any) => {
  try {
    const { publicId } = req.query;
    if (!publicId) return res.status(400).json({ status: 'error', message: 'No publicId provided' });

    const url = cloudinary.utils.private_download_url(publicId, 'pdf', {
      expires_at: Math.floor(Date.now() / 1000) + 600 // 10 minutes
    });
    res.json({ status: 'success', url });
  } catch (e: any) {
    res.status(500).json({ status: 'error', message: e.message });
  }
};
