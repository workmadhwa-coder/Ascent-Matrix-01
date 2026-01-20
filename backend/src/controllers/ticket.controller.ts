import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Resend } from 'resend';
import { Buffer } from 'buffer';
import fetch from 'node-fetch';
import { db } from '../config/firebase.js';
import cloudinary from '../config/cloudinary.js';

// Initialize Resend
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// HELPER: CREATE PDF BUFFER
// ============================================
const createPDFBuffer = async (registrationData: any, paymentId: string): Promise<Buffer> => {
  try {
    // Generate QR Code EXACTLY AS SHOWN IN CONFIRMATION PAGE
    // Using the same format: just the registration ID
    const qrData = registrationData.id;
    
    console.log('🔍 Generating QR Code for ID:', qrData);
    
    // Generate QR Code buffer with high error correction
    const qrBuffer = await QRCode.toBuffer(qrData, {
      margin: 1,
      width: 200,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log('✅ QR Code generated successfully');

    // Fetch logo with error handling
    let logoBuffer: Buffer | null = null;
    try {
      const logoRes = await fetch(
        'https://res.cloudinary.com/dzss2fubc/image/upload/v1767631444/Ascent_Matrix_White_ju8ras.png',
        { timeout: 5000 } as any
      );
      if (!logoRes.ok) throw new Error('Logo fetch failed');
      logoBuffer = Buffer.from(await logoRes.arrayBuffer());
      console.log('✅ Logo fetched successfully');
    } catch (error) {
      console.warn('⚠️ Logo fetch failed, proceeding without logo');
    }

    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 0,
      bufferPages: true 
    });
    
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));

    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
    });

    // ============================================
    // HEADER SECTION (Dark Blue Background)
    // ============================================
    doc.rect(0, 0, doc.page.width, 160).fill('#1e293b');
    
    // Logo (if available)
    if (logoBuffer) {
      try {
        doc.image(logoBuffer, 50, 30, { width: 100 });
      } catch (e) {
        console.warn('⚠️ Could not embed logo');
      }
    }
    
    // Event Title
    doc.fillColor('#ffffff')
       .fontSize(32)
       .font('Helvetica-Bold')
       .text('ASCENT MATRIX 2026', 170, 35, { width: 350 });
    
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#94a3b8')
       .text('OFFICIAL DELEGATE PASS', 170, 75);

    // Decorative line
    doc.moveTo(50, 165)
       .lineTo(doc.page.width - 50, 165)
       .lineWidth(3)
       .strokeColor('#8b5cf6')
       .stroke();

    // ============================================
    // DELEGATE INFORMATION CARD
    // ============================================
    let yPos = 200;
    
    // Card Background
    doc.roundedRect(50, yPos, doc.page.width - 100, 340, 15)
       .fillAndStroke('#f8fafc', '#e2e8f0');

    // Card Header
    doc.fillColor('#0f172a')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('DELEGATE INFORMATION', 70, yPos + 25);

    doc.moveTo(70, yPos + 55)
       .lineTo(doc.page.width - 70, yPos + 55)
       .strokeColor('#cbd5e1')
       .lineWidth(1)
       .stroke();

    // Left Column - Delegate Details
    let detailY = yPos + 80;
    const labelX = 70;
    const valueX = 220;
    const lineHeight = 35;

    const addDetailRow = (label: string, value: string) => {
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#64748b')
         .text(label, labelX, detailY);
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#1e293b')
         .text(value || '—', valueX, detailY, { width: 200 });
      
      detailY += lineHeight;
    };

    addDetailRow('Full Name:', registrationData.fullName);
    addDetailRow('Email:', registrationData.email);
    addDetailRow('Phone:', registrationData.phone);
    addDetailRow('Organization:', registrationData.organization || 'Not Specified');
    addDetailRow('Designation:', registrationData.designation || 'Not Specified');
    addDetailRow('Delegate ID:', registrationData.id);
    addDetailRow('Ticket Type:', registrationData.ticketType);
    addDetailRow('Payment ID:', paymentId);

    // Right Column - QR Code
    const qrX = doc.page.width - 240;
    const qrY = yPos + 70;
    
    // QR Code Container with white background
    doc.roundedRect(qrX, qrY, 170, 220, 10)
       .fillAndStroke('#ffffff', '#cbd5e1');

    // QR Code Image - EXACT SAME DATA AS CONFIRMATION PAGE
    doc.image(qrBuffer, qrX + 10, qrY + 10, { width: 150, height: 150 });

    // QR Label
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#64748b')
       .text('Scan for Verification', qrX, qrY + 170, { 
         width: 170, 
         align: 'center' 
       });

    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text(`Pass Count: ${registrationData.ticketCount || 1}`, qrX, qrY + 190, { 
         width: 170, 
         align: 'center' 
       });

    // ============================================
    // GENERATION INFO SECTION
    // ============================================
    yPos = yPos + 360;
    
    doc.roundedRect(50, yPos, doc.page.width - 100, 60, 10)
       .fill('#eff6ff');

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#475569')
       .text(`Generated On: ${dateStr} at ${timeStr}`, 70, yPos + 15);

    doc.text(`Number of Passes: ${registrationData.ticketCount || 1}`, 70, yPos + 35);

    // ============================================
    // EVENT VENUE SECTION
    // ============================================
    yPos = yPos + 90;

    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#0f172a')
       .text('EVENT VENUE', 50, yPos);

    doc.fontSize(13)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Chowdiah Memorial Hall', 50, yPos + 30);

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#475569')
       .text('16th Cross Rd, Vyalikaval, Kodandarampura', 50, yPos + 52);
    
    doc.text('Malleshwaram, Bengaluru, Karnataka 560003', 50, yPos + 70);

    // ============================================
    // FOOTER SECTION
    // ============================================
    const footerY = doc.page.height - 100;
    
    doc.rect(0, footerY, doc.page.width, 100)
       .fill('#1e293b');

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#cbd5e1')
       .text(
         'Please carry this delegate pass for entry verification.\nQR code will be scanned at the venue entrance.',
         50,
         footerY + 25,
         { width: doc.page.width - 100, align: 'center' }
       );

    doc.fontSize(9)
       .fillColor('#94a3b8')
       .text(
         '© 2026 Ascent Matrix. All rights reserved.',
         50,
         footerY + 65,
         { width: doc.page.width - 100, align: 'center' }
       );

    doc.end();
    
    const pdfBuffer = await pdfPromise;
    console.log('✅ PDF created successfully');
    
    return pdfBuffer;

  } catch (error) {
    console.error('❌ PDF Creation Error:', error);
    throw new Error('Failed to create PDF');
  }
};

// ============================================
// GENERATE PDF + SEND EMAIL
// ============================================
export const generateAndEmail = async (req: any, res: any) => {
  const { registrationData, paymentId } = req.body;

  try {
    // Validate input data
    if (!registrationData || !registrationData.id || !registrationData.email) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid registration data' 
      });
    }

    console.log('📧 Starting ticket generation and email process');
    console.log('   Registration ID:', registrationData.id);
    console.log('   Email:', registrationData.email);
    console.log('   Payment ID:', paymentId);

    // Generate PDF with QR code (same as confirmation page)
    const pdfBuffer = await createPDFBuffer(registrationData, paymentId);
    console.log('✅ PDF buffer created, size:', pdfBuffer.length, 'bytes');

    // Create HTML email content
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #1e293b; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
            ASCENT MATRIX 2026
          </h1>
          <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 2px;">
            OFFICIAL DELEGATE PASS
          </p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">
            Hello ${registrationData.fullName},
          </h2>
          
          <p style="color: #475569; line-height: 1.8; margin: 0 0 20px 0; font-size: 15px;">
            Thank you for registering for <strong>Ascent Matrix 2026</strong>!
          </p>
          
          <p style="color: #475569; line-height: 1.8; margin: 0 0 30px 0; font-size: 15px;">
            Your official delegate pass is attached to this email. Please download and carry it to the event venue for entry verification.
          </p>
          
          <div style="background: #eff6ff; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #8b5cf6;">
            <p style="margin: 0 0 12px 0; color: #1e293b; font-size: 14px;">
              <strong style="display: inline-block; width: 120px;">Event:</strong> 
              Ascent Matrix 2026
            </p>
            <p style="margin: 0 0 12px 0; color: #1e293b; font-size: 14px;">
              <strong style="display: inline-block; width: 120px;">Venue:</strong> 
              Chowdiah Memorial Hall, Bengaluru
            </p>
            <p style="margin: 0 0 12px 0; color: #1e293b; font-size: 14px;">
              <strong style="display: inline-block; width: 120px;">Delegate ID:</strong> 
              ${registrationData.id}
            </p>
            <p style="margin: 0; color: #1e293b; font-size: 14px;">
              <strong style="display: inline-block; width: 120px;">Payment ID:</strong> 
              ${paymentId}
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
              Important Instructions
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
              <li>Carry the attached delegate pass to the venue</li>
              <li>The QR code will be scanned at the entrance for verification</li>
              <li>Entry is subject to pass verification</li>
            </ul>
          </div>
          
          <p style="color: #475569; line-height: 1.8; margin: 30px 0 10px 0; font-size: 15px;">
            Looking forward to seeing you at the event!
          </p>
          
          <p style="color: #475569; margin: 0; font-size: 15px;">
            Best regards,<br>
            <strong>Ascent Matrix Team</strong>
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">
            © 2026 Ascent Matrix. All rights reserved.
          </p>
        </div>
      </div>
    `;

    // Send email with PDF attachment using Resend
    console.log('📤 Sending email via Resend...');
    await resend.emails.send({
      from: 'Ascent Matrix <noreply@ascentmatrix.com>',
      to: registrationData.email,
      subject: '🎫 Your Ascent Matrix 2026 Delegate Pass',
      html: emailHTML,
      attachments: [
        {
          filename: `AscentMatrix_Pass_${registrationData.id}.pdf`,
          content: pdfBuffer.toString('base64'),
        }
      ],
    });

    console.log('✅ Email sent successfully to:', registrationData.email);

    return res.status(200).json({ 
      status: 'success', 
      message: 'Ticket generated and email sent successfully' 
    });

  } catch (error) {
    console.error('❌ Ticket & Email Error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Failed to generate or send ticket',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============================================
// DOWNLOAD PDF ONLY
// ============================================
export const downloadTicket = async (req: any, res: any) => {
  const { registrationData, paymentId } = req.body;
  
  try {
    // Validate input data
    if (!registrationData || !registrationData.id) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid registration data' 
      });
    }

    console.log('📥 Starting PDF download generation');
    console.log('   Registration ID:', registrationData.id);
    console.log('   Payment ID:', paymentId);

    // Generate PDF with EXACT SAME QR code as confirmation page
    const pdfBuffer = await createPDFBuffer(registrationData, paymentId);
    console.log('✅ PDF generated for download, size:', pdfBuffer.length, 'bytes');

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename=AscentMatrix_Pass_${registrationData.id}.pdf`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    return res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Download Error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Download failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============================================
// REGISTER USER (HANDLES CONDITIONAL PDF)
// ============================================
export const registerUser = async (req: any, res: any) => {
  try {
    const {
      fullName, email, phone, ticketType, registrationId,
      problemStatement, solution, domains, purposes,
      gender, city, state, organization, designation, orgType, 
      orgTypeOther, domainsOther, ecosystemRole, qucInterest, 
      stallType, stallPrice, ticketCount, totalAmount, paymentId
    } = req.body;

    console.log('=== REGISTRATION REQUEST ===');
    console.log('Ticket Type:', ticketType);
    console.log('Registration ID:', registrationId);

    // Check if this is an Ideathon registration
    const isIdeathon = ticketType?.toLowerCase().includes('ideathon');

    // Validate PDF upload for Ideathon registrations
    if (isIdeathon && !req.file) {
      console.error('❌ ERROR: Ideathon ticket selected but no PDF found');
      return res.status(400).json({
        status: 'error',
        message: 'Ideathon participation requires a PDF proposal upload.',
      });
    }

    // Validate required fields
    if (!fullName || !email || !phone || !registrationId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Missing required fields' 
      });
    }

    // Handle uploaded file data (for Ideathon proposals)
    const pdfUrl = req.file ? req.file.path : null;
    const pdfPublicId = req.file?.public_id || req.file?.filename || null;

    // Parse JSON arrays safely
    let parsedDomains = [];
    let parsedPurposes = [];
    try {
      if (domains) {
        parsedDomains = typeof domains === 'string' ? JSON.parse(domains) : domains;
      }
      if (purposes) {
        parsedPurposes = typeof purposes === 'string' ? JSON.parse(purposes) : purposes;
      }
    } catch (e) {
      console.warn('⚠️ Parse warning:', e);
    }

    // Construct registration data object
    const registrationData: any = {
      id: registrationId,
      fullName,
      email,
      phone,
      ticketType,
      gender: gender || '',
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
      stallPrice: Number(stallPrice) || 0,
      ticketCount: Number(ticketCount) || 1,
      totalAmount: Number(totalAmount) || 0,
      paymentId: paymentId || '',
      // Only include Ideathon-specific fields if applicable
      problemStatement: isIdeathon ? (problemStatement || '') : '',
      solution: isIdeathon ? (solution || '') : '',
      pdfUrl: pdfUrl,
      paymentStatus: 'PENDING',
      createdAt: new Date(),
    };

    // Add PDF public ID if available
    if (pdfPublicId) {
      registrationData.pdfPublicId = pdfPublicId;
    }

    // Save to Firestore
    await db.collection('registrations').doc(registrationId).set(registrationData);

    console.log(`✅ ${isIdeathon ? 'Ideathon' : 'Event'} Registration Saved:`, registrationId);

    return res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: { id: registrationId, pdfUrl }
    });

  } catch (error) {
    console.error('❌ REGISTRATION ERROR:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============================================
// GET SIGNED PDF URL
// ============================================
export const getSignedPdfUrl = async (req: any, res: any) => {
  try {
    const { publicId } = req.query;
    
    // Validate input
    if (!publicId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'publicId required' 
      });
    }

    // Generate signed URL for Cloudinary resource
    const signedUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
      expires_at: Math.floor(Date.now() / 1000) + 600, // 10 minutes expiry
    });

    console.log('✅ Signed URL generated for:', publicId);

    return res.status(200).json({ 
      status: 'success', 
      url: signedUrl 
    });

  } catch (error) {
    console.error('❌ Signed URL Error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Failed to generate link',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
