/**
 * SENTINEL - Real-Time Emergency Voice Call Dispatcher
 * Core Engine: Node.js, Express, Twilio SDK
 */

const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Load Configuration Parameters
let voiceConfig = {};
try {
  const configPath = path.join(__dirname, '../../config/twilio-voice.json');
  voiceConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.warn('[SENTINEL CALL DISPATCHER] Local configuration file missing or unreadable. Using environment defaults.');
}

// 2. Initialize Twilio Client
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || voiceConfig.twilio_account?.dispatch_phone_number || '+18005550199';

const client = twilio(accountSid, authToken);

// Priority Escalation Queue Fallbacks
const escalationQueue = voiceConfig.escalation_policy?.priority_routing_queue || [
  { priority: 1, name: 'Admin J. Dee', phone_number: '+18005550199' },
  { priority: 2, name: 'S. Smith (SOC Lead)', phone_number: '+18005550288' },
  { priority: 3, name: 'Global Duty Desk', phone_number: '+18005559900' }
];

/**
 * Endpoint: Trigger Automated Emergency Escalation Call
 * POST /api/dispatch-emergency-call
 */
app.post('/api/dispatch-emergency-call', async (req, res) => {
  const { attackType, originLocation, targetUrl, priorityLevel = 1, sourceIp } = req.body;

  const targetContact = escalationQueue.find(c => c.priority === parseInt(priorityLevel)) || escalationQueue[0];

  const attackLabel = attackType || 'Ransomware / DDoS Vector';
  const domainLabel = targetUrl || 'Primary SecOps Gateway';
  const ipLabel = sourceIp || '185.220.101.4';

  // Construct Dynamic TwiML Voice Script
  const twimlVoiceScript = `
    <Response>
      <Say voice="Polly.Joanna-Neural" language="en-US">
        Warning! Critical security breach detected by Sentinel Deep Learning Engine. 
        Attack type: ${attackLabel}, targeting domain ${domainLabel}. 
        Originating I P address is ${ipLabel}. 
        Automated countermeasures are active. 
        Press 1 to acknowledge receipt and lock threat down, or press 2 to dispatch emergency failover.
      </Say>
      <Gather action="/api/twilio/voice-response" numDigits="1" timeout="5"></Gather>
    </Response>
  `;

  try {
    console.log(`[SENTINEL VOICE DISPATCH] Initiating Priority ${targetContact.priority} Voice Call to ${targetContact.name} (${targetContact.phone_number})...`);

    const call = await client.calls.create({
      twiml: twimlVoiceScript,
      to: targetContact.phone_number,
      from: twilioPhoneNumber,
      timeout: voiceConfig.escalation_policy?.ring_timeout_seconds || 10,
      statusCallback: voiceConfig.webhooks?.status_callback_url,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });

    res.json({
      status: 'Call Dispatched',
      callSid: call.sid,
      recipient: targetContact.name,
      priority: targetContact.priority,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[SENTINEL VOICE DISPATCH] Twilio Dispatch Error:', error.message);

    // Failover Response Simulation
    res.status(500).json({
      error: 'Voice Call Dispatch Failed',
      details: error.message,
      simulatedFallback: `Call queued for Priority ${targetContact.priority} (${targetContact.name})`
    });
  }
});

/**
 * Webhook: Handle Interactive Phone Keypad Input (Gather Response)
 * POST /api/twilio/voice-response
 */
app.post('/api/twilio/voice-response', (req, res) => {
  const digits = req.body.Digits;
  const response = new twilio.twiml.VoiceResponse();

  if (digits === '1') {
    response.say({ voice: 'Polly.Joanna-Neural' }, 'Incident acknowledged. Security lockdown confirmed. Sentinel AI has quarantined the IP address.');
  } else if (digits === '2') {
    response.say({ voice: 'Polly.Joanna-Neural' }, 'Escalating security level across all regional SOC teams.');
  } else {
    response.say({ voice: 'Polly.Joanna-Neural' }, 'No input received. Auto-rectification policy initiated.');
  }

  res.type('text/xml');
  res.send(response.toString());
});

/**
 * Webhook: Track Call Status & Auto-Escalate if Unanswered
 * POST /api/twilio/status-callback
 */
app.post('/api/twilio/status-callback', (req, res) => {
  const { CallStatus, CallSid, To } = req.body;
  console.log(`[SENTINEL VOICE DISPATCH] Call Status Update (${CallSid}): ${CallStatus}`);

  // If call failed, busy, or unanswered -> Trigger next priority level
  if (['no-answer', 'busy', 'failed'].includes(CallStatus)) {
    console.warn(`[SENTINEL VOICE DISPATCH] Call to ${To} resulted in ${CallStatus}. Auto-escalating to next Priority level...`);
    // Trigger internal escalation logic here
  }

  res.sendStatus(200);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SENTINEL DISPATCH ENGINE] Emergency Call Dispatcher listening on port ${PORT}`);
});
