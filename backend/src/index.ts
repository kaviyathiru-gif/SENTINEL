import express, { Express, Request, Response } from 'express';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { initializeModels } from './ml/models.js';
import { processNetworkPacket } from './ml/inference.js';
import type { SecurityEvent, SystemHealth } from './types.js';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize ML/DL models
let models: any = null;

async function initializeApp() {
  try {
    models = await initializeModels();
    console.log('✓ ML/DL models loaded successfully');
  } catch (error) {
    console.error('Failed to load ML models:', error);
  }
}

// REST API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'operational',
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

app.get('/api/events', (_req: Request, res: Response) => {
  // Return recent events from database
  res.json({ events: [] });
});

app.post('/api/threat-intel', (req: Request, res: Response) => {
  const { sourceIp, destinationIp, protocol, payload } = req.body;
  
  // Process through ML model
  const prediction = processNetworkPacket({
    sourceIp,
    destinationIp,
    protocol,
    payload
  }, models);

  res.json({
    isProbablyThreat: prediction.score > 0.7,
    confidenceScore: prediction.score,
    threatType: prediction.threatType,
    recommendations: prediction.recommendations
  });
});

// WebSocket Events
io.on('connection', (socket: Socket) => {
  console.log(`✓ Client connected: ${socket.id}`);

  // Send initial system health
  const initialHealth: SystemHealth = {
    cpuUsage: Math.floor(Math.random() * 100),
    memoryUsage: Math.floor(Math.random() * 100),
    networkUsage: Math.floor(Math.random() * 100),
    uptime: '99.9%'
  };
  socket.emit('health', initialHealth);

  socket.on('disconnect', () => {
    console.log(`✗ Client disconnected: ${socket.id}`);
  });

  socket.on('error', (error: Error) => {
    console.error(`WebSocket error for ${socket.id}:`, error);
  });
});

// Simulated threat stream (in production, this would come from actual network monitoring)
function startThreatStream() {
  const threatTypes = ['Brute Force', 'Malware', 'Port Scan', 'DoS', 'SQL Injection'];
  const severities: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low'];

  setInterval(() => {
    const event: SecurityEvent = {
      id: uuidv4(),
      timestamp: Date.now(),
      type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      source: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      destination: `192.168.1.${Math.floor(Math.random() * 256)}`,
      protocol: Math.random() > 0.5 ? 'TCP' : 'UDP',
      details: 'Suspicious network activity detected'
    };

    io.emit('event', event);
  }, 2000);
}

// System health updates
function startHealthUpdates() {
  setInterval(() => {
    const health: SystemHealth = {
      cpuUsage: Math.floor(Math.random() * 100),
      memoryUsage: Math.floor(Math.random() * 100),
      networkUsage: Math.floor(Math.random() * 100),
      uptime: '99.9%'
    };

    io.emit('health', health);
  }, 5000);
}

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, async () => {
  await initializeApp();
  startThreatStream();
  startHealthUpdates();
  console.log(`\n🛡️  Sentinel NIDS Backend Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ WebSocket ready for client connections\n`);
});
