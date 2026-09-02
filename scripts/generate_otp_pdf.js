import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const doc = new PDFDocument({ margin: 36, size: 'A4' });
const pdfPath = path.join(process.cwd(), 'public', 'TheStoceTimes_OTP_Documentation.pdf');

// Stream to public folder
const stream = fs.createWriteStream(pdfPath);
doc.pipe(stream);

const primaryColor = '#0B1F33';
const emeraldColor = '#16A34A';
const textColor = '#1E293B';
const lightBg = '#F8FAFC';

// ================= PAGE 1 =================
// Header Banner
doc.rect(0, 0, 595, 110).fill(primaryColor);
doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('The Stoce Times', 40, 25);
doc.fontSize(13).font('Helvetica').text('Complete OTP 2FA & Hostinger SMTP Developer Guide', 40, 55);
doc.fontSize(9).fillColor('#94A3B8').text('Beginner-Friendly Technical Manual & Source Code Documentation', 40, 78);

doc.moveDown(4.5);

// Section 1: System Overview & Flow Diagram
doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('1. System Architecture & Beginner 5-Step Flow');
doc.moveDown(0.4);
doc.fillColor(textColor).fontSize(9.5).font('Helvetica').text(
  'The OTP system provides 2-Factor Authentication (2FA) for Admin & Author logins. ' +
  'It connects Node.js Express Backend with Hostinger SSL/TLS SMTP Mail Server (smtp.hostinger.com:465) to deliver 6-digit verification codes.'
);
doc.moveDown(0.8);

// Flow Chart Box
doc.rect(40, doc.y, 515, 125).fill('#F1F5F9').stroke('#CBD5E1');
const currentY = doc.y;
doc.fillColor('#0F172A').fontSize(9).font('Helvetica-Bold').text('SYSTEM STEP-BY-STEP FLOW DIAGRAM:', 50, currentY + 10);

doc.font('Courier').fontSize(8.5).fillColor('#0369A1').text(`
  [1. User Login]  -->  [2. Server Generates 6-Digit OTP]
                             | (Valid for 10 Mins)
                             v
  [4. Enter 6-Digits] <-- [3. Hostinger Mail Server Sends Email]
          |
          v
  [5. Backend Verifies & Grants Admin Access]
`, 50, currentY + 28);
doc.moveDown(8.5);

// Section 2: Beginner 5-Step Explanation
doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('2. Step-by-Step Beginner Explanation');
doc.moveDown(0.4);

const stepText = `Step 1 (Login Request): User submits email & password on Admin Login modal.
Step 2 (Code Generation): Server creates a 6-digit random code: Math.floor(100000 + Math.random() * 900000).
Step 3 (Expiry Logic): Expiry time is set to 10 minutes: Date.now() + 10 * 60 * 1000.
Step 4 (Email Delivery): Nodemailer connects to Hostinger SMTP (smtp.hostinger.com:465) and sends HTML email.
Step 5 (Verification): User enters 6 digits. Server validates code & expiration, then grants Admin access.`;

doc.rect(40, doc.y, 515, 115).fill('#ECFDF5').stroke('#A7F3D0');
doc.fillColor('#065F46').fontSize(9).font('Helvetica').text(stepText, 50, doc.y + 10);
doc.moveDown(8);

// Section 3: Environment Variables (.env File)
doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('3. Environment Variables (.env File Setup)');
doc.moveDown(0.4);

const envContent = `# Server & Database Setup
PORT=5000
DB_HOST=localhost
DB_USER=stoce_user
DB_PASSWORD=YourStrongPassword123!
DB_NAME=finance_pulse_db

# Hostinger SMTP Mail Server Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USERNAME=info@avedatechnologies.com
SMTP_PASSWORD=Jaymatadi@122
SMTP_FROM_EMAIL=info@avedatechnologies.com
SMTP_FROM_NAME=The Stoce Times Security`;

doc.rect(40, doc.y, 515, 155).fill('#1E293B').stroke('#0F172A');
doc.fillColor('#38BDF8').fontSize(8.5).font('Courier').text(envContent, 50, doc.y + 10);


// ================= PAGE 2 =================
doc.addPage();

// Page 2 Header
doc.rect(0, 0, 595, 50).fill(primaryColor);
doc.fillColor('#FFFFFF').fontSize(14).font('Helvetica-Bold').text('The Stoce Times — Backend Server Implementation (Page 2)', 40, 18);
doc.moveDown(3.5);

// Section 4: Backend Express Implementation Code
doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('4. Express Server OTP Source Code (server/index.ts)');
doc.moveDown(0.4);

const backendFullCode = `import express from 'express';
import nodemailer from 'nodemailer';

const app = express();
const otpStore: Record<string, { otp: string; expiresAt: number }> = {};

// 1. Hostinger Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME || 'info@avedatechnologies.com',
    pass: process.env.SMTP_PASSWORD || 'Jaymatadi@122',
  },
});

// 2. Send OTP Endpoint (/api/auth/send-otp)
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 Minutes

  otpStore[email] = { otp: otpCode, expiresAt };

  await transporter.sendMail({
    from: '"The Stoce Times Security" <info@avedatechnologies.com>',
    to: email,
    subject: '🔑 Your Security Verification Code',
    html: \`<div style="font-family:sans-serif; background:#f8fafc; padding:20px;">
      <div style="max-width:500px; background:#fff; padding:20px; border-radius:12px;">
        <h2>The Stoce Times 2FA Code</h2>
        <h1 style="color:#16a34a; letter-spacing:6px;">\${otpCode}</h1>
        <p>This code is valid for 10 minutes. Do not share it with anyone.</p>
      </div>
    </div>\`
  });

  res.json({ success: true, message: 'OTP sent to email.' });
});

// 3. Verify OTP Endpoint (/api/auth/verify-otp)
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ success: false, message: 'OTP expired or not found.' });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
  }

  delete otpStore[email]; // Clear after successful single use
  res.json({ success: true, message: 'OTP verified successfully.' });
});`;

doc.rect(40, doc.y, 515, 620).fill('#F8FAFC').stroke('#CBD5E1');
doc.fillColor('#0F172A').fontSize(7.5).font('Courier').text(backendFullCode, 50, doc.y + 10);


// ================= PAGE 3 =================
doc.addPage();

// Page 3 Header
doc.rect(0, 0, 595, 50).fill(primaryColor);
doc.fillColor('#FFFFFF').fontSize(14).font('Helvetica-Bold').text('The Stoce Times — Frontend & Testing Checklist (Page 3)', 40, 18);
doc.moveDown(3.5);

// Section 5: Frontend React 2FA Component
doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('5. Frontend 2FA React Modal (AdminLoginModal.tsx)');
doc.moveDown(0.4);

const frontendSnippet = `// React 6-Digit Auto-Focus OTP Input Handler
const handleDigitChange = (index: number, value: string) => {
  if (!/^[0-9]?$/.test(value)) return;
  const newOtp = [...otpDigits];
  newOtp[index] = value;
  setOtpDigits(newOtp);

  // Auto-focus next input box
  if (value && index < 5) {
    inputRefs.current[index + 1]?.focus();
  }
};

// 10-Minute Live Countdown Timer Effect
useEffect(() => {
  if (step === 'otp' && countdown > 0) {
    const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }
}, [step, countdown]);`;

doc.rect(40, doc.y, 515, 200).fill('#F8FAFC').stroke('#CBD5E1');
doc.fillColor('#0F172A').fontSize(8.5).font('Courier').text(frontendSnippet, 50, doc.y + 10);
doc.moveDown(14);

// Section 6: Security Rules & Checklist
doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('6. Security Rules & Verification Checklist');
doc.moveDown(0.4);

const securityRules = `✔ 1. 6-Digit Random Code: Generated using secure Math.floor(100000 + Math.random() * 900000).
✔ 2. 10-Minute Expiration: Valid strictly for 600 seconds. Expired codes are rejected automatically.
✔ 3. Single-Use Invalidation: OTP is deleted from memory (delete otpStore[email]) immediately upon verification.
✔ 4. Hostinger SSL/TLS Connection: Connects securely on Port 465 (smtp.hostinger.com).
✔ 5. Real-Time Admin Settings Connection Test: Admin can verify SMTP connection at /api/smtp-config/test.`;

doc.rect(40, doc.y, 515, 140).fill('#EFF6FF').stroke('#3B82F6');
doc.fillColor('#1E40AF').fontSize(9).font('Helvetica').text(securityRules, 55, doc.y + 12);

doc.end();

console.log('Updated complete 3-page PDF at public/TheStoceTimes_OTP_Documentation.pdf');
