/**
 * SENTINEL - Automated Gmail Incident & Summary Dispatcher
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

// 1. Load Gmail Configuration & Templates
let gmailConfig = {};
try {
  const configPath = path.join(__dirname, '../../config/gmail-config.json');
  gmailConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.warn('[SENTINEL MAILER] Configuration file missing or unreadable. Using default environment settings.');
}

// 2. Initialize Nodemailer Transporter (OAuth2 / Direct SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER || gmailConfig.smtp_settings?.auth?.user || 'admin.soc@google-pixel.org',
    clientId: process.env.GMAIL_CLIENT_ID || gmailConfig.smtp_settings?.auth?.clientId,
    clientSecret: process.env.GMAIL_CLIENT_SECRET || gmailConfig.smtp_settings?.auth?.clientSecret,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN || gmailConfig.smtp_settings?.auth?.refreshToken
  }
});

/**
 * Helper: Generate PDF Security Incident Receipt Buffer
 */
function createPDFReceiptBuffer(incidentData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header Styling
    doc.fillColor('#9333ea').fontSize(22).text('SENTINEL AI DEFENSE RECEIPT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#06b6d4').fontSize(12).text('Confidential Network Intrusion & Auto-Rectification Report', { align: 'center' });
    doc.moveDown(1.5);

    // Table Divider
    doc.strokeColor('#2a224a').lineWidth(2).moveTo(50, 120).lineTo(550, 120).stroke();
    doc.moveDown(1);

    // Incident Details
    doc.fillColor('#e2e8f0').fontSize(12);
    doc.text(`Timestamp: ${incidentData.timestamp || new Date().toISOString()}`);
    doc.text(`Target Domain: ${incidentData.targetDomain || 'https://my-pixel-portal.org'}`);
    doc.text(`Attack Vector: ${incidentData.attackType || 'Ransomware / DDoS Injection'}`);
    doc.text(`Origin IP: ${incidentData.sourceIp || '185.220.101.4'} (${incidentData.originLocation || 'Frankfurt, Germany'})`);
    doc.text(`Status: ${incidentData.status || 'QUARANTINED & AUTO-RECTIFIED'}`);
    doc.text(`Mitigation Engine: ${incidentData.engine || 'LSTM Neural Network (99.4% Precision)'}`);

    doc.moveDown(2);
    doc.fillColor('#64748b').fontSize(10).text('This receipt was generated automatically by Sentinel SecOps Engine and forwarded to the Admin Gmail account.', { align: 'center' });

    doc.end();
  });
}

/**
 * Endpoint: Dispatch Immediate Attack Incident Email
 * POST /api/send-incident-report
 */
app.post('/api/send-incident-report', async (req, res) => {
  const { targetEmail, incident } = req.body;

  const recipientGmail = targetEmail || gmailConfig.recipients?.primary_admin_gmail || 'admin.soc@google-pixel.org';
  const incidentData = incident || {
    timestamp: new Date().toLocaleTimeString(),
    targetDomain: 'https://my-pixel-portal.org',
    attackType: 'Ransomware Vector',
    sourceIp: '185.220.101.4',
    originLocation: 'Frankfurt, Germany',
    status: 'Resolved',
    mitigationAction: 'IP Blocked & DOM Coordinates Snap-Restored'
  };

  try {
    // Generate PDF Buffer
    const pdfBuffer = await createPDFReceiptBuffer(incidentData);

    // Construct HTML Mail Body
    let htmlContent = gmailConfig.email_templates?.incident_receipt?.body_html || `
      <div style="background-color:#0a0814; color:#e2e8f0; padding:20px; font-family:monospace;">
        <h2 style="color:#06b6d4;">SENTINEL AI INCIDENT RECEIPT</h2>
        <p><strong style="color:#c084fc;">Target Domain:</strong> ${incidentData.targetDomain}</p>
        <p><strong style="color:#c084fc;">Attack Type:</strong> ${incidentData.attackType}</p>
        <p><strong style="color:#c084fc;">Origin IP:</strong> ${incidentData.sourceIp} (${incidentData.originLocation})</p>
        <p><strong style="color:#c084fc;">Status:</strong> <span style="background-color:#10b981; color:#000; padding:2px 6px; border-radius:4px;">${incidentData.status}</span></p>
      </div>
    `;

    // Mail Options
    const mailOptions = {
      from: `"SENTINEL AI Defense" <${gmailConfig.default_sender?.address || 'no-reply@sentinel-secops.org'}>`,
      to: recipientGmail,
      subject: `[SENTINEL CRITICAL ALERT] Security Incident Receipt - ${incidentData.attackType}`,
      html: htmlContent,
      attachments: [
        {
          filename: `Sentinel-Incident-Receipt-${Date.now()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    console.log(`[SENTINEL MAILER] Dispatching Incident Email to ${recipientGmail}...`);
    const info = await transporter.sendMail(mailOptions);

    res.json({
      status: 'Email Dispatched',
      messageId: info.messageId,
      recipient: recipientGmail,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[SENTINEL MAILER] Gmail Dispatch Error:', error.message);
    res.status(500).json({
      error: 'Gmail Dispatch Failed',
      details: error.message,
      simulatedFallback: `Report generated and logged locally for ${recipientGmail}`
    });
  }
});

/**
 * Endpoint: Dispatch Periodic Daily/Weekly/Monthly Comparison Metrics
 * POST /api/send-summary-report
 */
app.post('/api/send-summary-report', async (req, res) => {
  const { targetEmail, metrics } = req.body;
  const recipientGmail = targetEmail || gmailConfig.recipients?.primary_admin_gmail || 'admin.soc@google-pixel.org';

  const summaryData = metrics || {
    dailyCount: 142,
    weeklyCount: 980,
    monthlyUptime: 99.9,
    topTargetDomain: 'https://my-pixel-portal.org',
    topThreatVector: 'DDoS Syn-Flood'
  };

  const htmlContent = `
    <div style="background-color:#0a0814; color:#e2e8f0; padding:24px; font-family:sans-serif; border:1px solid #06b6d4; border-radius:12px;">
      <h2 style="color:#9333ea; margin-top:0;">SENTINEL SECURITY SUMMARY REPORT</h2>
      <p style="color:#94a3b8; font-size:13px;">Automated Daily, Weekly & Monthly Comparison Metrics</p>
      <div style="display:flex; gap:12px; margin:20px 0;">
        <div style="background:#141026; padding:12px; border-radius:8px; text-align:center; flex:1;">
          <div style="font-size:11px; color:#c084fc;">DAILY ATTACKS</div>
          <div style="font-size:22px; color:#06b6d4; font-weight:bold;">${summaryData.dailyCount}</div>
        </div>
        <div style="background:#141026; padding:12px; border-radius:8px; text-align:center; flex:1;">
          <div style="font-size:11px; color:#c084fc;">WEEKLY TOTAL</div>
          <div style="font-size:22px; color:#06b6d4; font-weight:bold;">${summaryData.weeklyCount}</div>
        </div>
        <div style="background:#141026; padding:12px; border-radius:8px; text-align:center; flex:1;">
          <div style="font-size:11px; color:#c084fc;">UPTIME</div>
          <div style="font-size:22px; color:#10b981; font-weight:bold;">${summaryData.monthlyUptime}%</div>
        </div>
      </div>
      <p style="font-size:13px;">Top Target Domain: <strong style="color:#ec4899;">${summaryData.topTargetDomain}</strong></p>
      <p style="font-size:13px;">Primary Threat Vector: <strong style="color:#06b6d4;">${summaryData.topThreatVector}</strong></p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"SENTINEL AI Defense" <${gmailConfig.default_sender?.address || 'no-reply@sentinel-secops.org'}>`,
      to: recipientGmail,
      subject: '[SENTINEL SEC-OPS] Daily, Weekly & Monthly Threat Comparison Metrics',
      html: htmlContent
    });

    res.json({ status: 'Summary Dispatched', messageId: info.messageId, recipient: recipientGmail });
  } catch (error) {
    console.error('[SENTINEL MAILER] Summary Dispatch Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`[SENTINEL MAILER ENGINE] Automated Gmail Dispatcher listening on port ${PORT}`);
});
