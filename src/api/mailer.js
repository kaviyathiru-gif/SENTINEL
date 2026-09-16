/**
 * SENTINEL - Automated Gmail Incident & Periodic Report Dispatcher
 * Core Engine: Node.js, Express, Nodemailer, PDFKit
 */

const express = require('express');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let gmailConfig = {};
try {
  const configPath = path.join(__dirname, '../../config/gmail-config.json');
  gmailConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.warn('[SENTINEL MAILER] Configuration file missing. Using environment defaults.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER || gmailConfig.smtp_settings?.auth?.user,
    clientId: process.env.GMAIL_CLIENT_ID || gmailConfig.smtp_settings?.auth?.clientId,
    clientSecret: process.env.GMAIL_CLIENT_SECRET || gmailConfig.smtp_settings?.auth?.clientSecret,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN || gmailConfig.smtp_settings?.auth?.refreshToken
  }
});

/**
 * Endpoint: Dispatch Periodic Daily, Weekly, Monthly, & Yearly Reports to Bound Admin Email
 * POST /api/send-periodic-report
 */
app.post('/api/send-periodic-report', async (req, res) => {
  const { adminEmail, metrics } = req.body;
  const recipient = adminEmail || gmailConfig.recipients?.primary_admin_gmail || 'admin.soc@google-pixel.org';

  const reportData = metrics || {
    dailyCount: 142,
    weeklyCount: 980,
    monthlyCount: 4250,
    yearlyCount: 51200,
    uptime: 99.94
  };

  const htmlContent = `
    <div style="background-color:#0a0814; color:#e2e8f0; padding:24px; font-family:sans-serif; border:1px solid #06b6d4; border-radius:12px;">
      <h2 style="color:#9333ea; margin-top:0;">SENTINEL SECURITY MULTI-PERIOD REPORT</h2>
      <p style="color:#94a3b8; font-size:13px;">Automated Daily, Weekly, Monthly & Yearly Threat Analysis</p>
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:20px 0;">
        <div style="background:#141026; padding:12px; border-radius:8px; text-align:center;">
          <div style="font-size:10px; color:#c084fc;">DAILY</div>
          <div style="font-size:18px; color:#06b6d4; font-weight:bold;">${reportData.dailyCount}</div>
        </div>
        <div style="background:#141026; padding:12px; border-radius:8px; text-align:center;">
          <div style="font-size:10px; color:#c084fc;">WEEKLY</div>
          <div style="font-size:18px; color:#06b6d4; font-weight:bold;">${reportData.weeklyCount}</div>
        </div>
        <div style="background:#141026; padding:12px; border-radius:8px; text-align:center;">
          <div style="font-size:10px; color:#c084fc;">MONTHLY</div>
          <div style="font-size:18px; color:#06b6d4; font-weight:bold;">${reportData.monthlyCount}</div>
        </div>
        <div style="background:#141026; padding:12px; border-radius:8px; text-align:center;">
          <div style="font-size:10px; color:#c084fc;">YEARLY</div>
          <div style="font-size:18px; color:#06b6d4; font-weight:bold;">${reportData.yearlyCount}</div>
        </div>
      </div>
      <p style="font-size:13px;">System Uptime: <strong style="color:#10b981;">${reportData.uptime}%</strong></p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"SENTINEL AI Defense" <${gmailConfig.default_sender?.address || 'no-reply@sentinel-secops.org'}>`,
      to: recipient,
      subject: '[SENTINEL SEC-OPS] Automated Daily, Weekly, Monthly & Yearly Security Report',
      html: htmlContent
    });

    res.json({ status: 'Periodic Reports Dispatched', messageId: info.messageId, recipient });
  } catch (error) {
    console.error('[SENTINEL MAILER] Error:', error.message);
    res.status(500).json({ error: error.message, fallback: `Report successfully compiled for ${recipient}` });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`[SENTINEL MAILER ENGINE] Gmail automated dispatcher listening on port ${PORT}`);
});
