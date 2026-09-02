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

export interface ThreatIntelligence {
  source: string;
  confidence: number;
  timestamp: number;
}

export interface MLModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface WebSocketMessage {
  type: 'event' | 'health' | 'threat' | 'metric';
  payload: any;
  timestamp: number;
}
