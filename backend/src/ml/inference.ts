import * as tf from '@tensorflow/tfjs-node';
import type { NetworkPacket, MLPrediction } from '../types.js';

const THREAT_CLASSES = [
  'Benign',
  'Brute Force Attack',
  'Malware',
  'Denial of Service',
  'Port Scan'
];

/**
 * Process network packet and predict threat level using ensemble ML model
 * Extracts features from packet headers, payload, and protocol information
 */
export function processNetworkPacket(
  packet: NetworkPacket,
  models: any
): MLPrediction {
  try {
    // Extract features from packet
    const features = extractPacketFeatures(packet);
    
    // Convert to tensor
    const inputTensor = tf.tensor2d([features], [1, features.length]);

    // Get ensemble prediction
    let prediction = models.ensemble.predict(inputTensor);
    
    if (Array.isArray(prediction)) {
      prediction = prediction[0];
    }

    const scores = Array.from(prediction.dataSync ? prediction.dataSync() : []);
    const threatIndex = scores.indexOf(Math.max(...scores));
    const confidenceScore = scores[threatIndex];

    // Clean up tensors
    tf.dispose([inputTensor, prediction]);

    return {
      score: confidenceScore,
      threatType: THREAT_CLASSES[threatIndex],
      confidence: confidenceScore * 100,
      recommendations: generateRecommendations(
        THREAT_CLASSES[threatIndex],
        confidenceScore
      )
    };
  } catch (error) {
    console.error('Error in packet processing:', error);
    return {
      score: 0,
      threatType: 'Unknown',
      confidence: 0,
      recommendations: ['Review manually']
    };
  }
}

/**
 * Extract statistical and protocol features from network packet
 * Returns normalized feature vector
 */
function extractPacketFeatures(packet: NetworkPacket): number[] {
  const features: number[] = [];

  // IP-based features
  const sourceOctets = packet.sourceIp.split('.').map(Number);
  const destOctets = packet.destinationIp.split('.').map(Number);
  features.push(...sourceOctets, ...destOctets);

  // Protocol encoding
  const protocolMap: Record<string, number> = {
    TCP: 0.3,
    UDP: 0.5,
    ICMP: 0.7,
    IGMP: 0.8,
    GRE: 0.9
  };
  features.push(protocolMap[packet.protocol] || 0.1);

  // Payload features
  const payload = typeof packet.payload === 'string' 
    ? Buffer.from(packet.payload) 
    : packet.payload;

  features.push(payload.length / 1024); // Payload size (normalized to KB)
  features.push(calculateEntropy(payload)); // Entropy (compression measure)
  features.push(countNullBytes(payload) / Math.max(payload.length, 1)); // Null byte ratio

  // Time-based features
  const timestamp = packet.timestamp || Date.now();
  const hour = new Date(timestamp).getHours();
  features.push(hour / 24); // Hour (normalized)

  // Flags
  const flags = packet.flags || [];
  features.push(flags.includes('SYN') ? 1 : 0);
  features.push(flags.includes('FIN') ? 1 : 0);
  features.push(flags.includes('RST') ? 1 : 0);
  features.push(flags.includes('PSH') ? 1 : 0);
  features.push(flags.includes('ACK') ? 1 : 0);

  // Pad/trim to 128 features
  while (features.length < 128) {
    features.push(0);
  }

  return features.slice(0, 128).map(f => isNaN(f) ? 0 : f);
}

/**
 * Calculate Shannon entropy of payload (higher = more random = more suspicious)
 */
function calculateEntropy(data: Buffer): number {
  const freq: Record<number, number> = {};
  
  for (const byte of data) {
    freq[byte] = (freq[byte] || 0) + 1;
  }

  let entropy = 0;
  const len = data.length;

  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  return entropy / 8; // Normalize to 0-1
}

/**
 * Count null bytes (common in malicious payloads)
 */
function countNullBytes(data: Buffer): number {
  return Array.from(data).filter(b => b === 0).length;
}

/**
 * Generate security recommendations based on threat type
 */
function generateRecommendations(threatType: string, confidence: number): string[] {
  const recommendations: Record<string, string[]> = {
    'Benign': ['Monitor connection', 'Log for audit trail'],
    'Brute Force Attack': ['Block source IP', 'Alert SOC team', 'Enable MFA'],
    'Malware': ['Isolate endpoint', 'Run antivirus scan', 'Quarantine sample'],
    'Denial of Service': ['Enable rate limiting', 'Contact ISP', 'Activate DDoS mitigation'],
    'Port Scan': ['Block suspicious IPs', 'Review open ports', 'Harden firewall']
  };

  const baseRecommendations = recommendations[threatType] || ['Review manually'];

  if (confidence > 0.95) {
    baseRecommendations.push('Automatic blocking enabled');
  } else if (confidence > 0.75) {
    baseRecommendations.push('Manual review required');
  }

  return baseRecommendations;
}
