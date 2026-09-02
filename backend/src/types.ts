export interface SecurityEvent {
  id: string;
  timestamp: number;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  destination: string;
  protocol: string;
  details: string;
}

export interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  networkUsage: number;
  uptime: string;
}

export interface NetworkPacket {
  sourceIp: string;
  destinationIp: string;
  protocol: string;
  payload: Buffer | string;
  timestamp?: number;
  packetSize?: number;
  flags?: string[];
}

export interface MLPrediction {
  score: number;
  threatType: string;
  confidence: number;
  recommendations: string[];
}

export interface ModelConfig {
  modelType: 'dnn' | 'cnn' | 'lstm' | 'ensemble';
  inputShape: number[];
  outputClasses: string[];
  weights: string;
}
