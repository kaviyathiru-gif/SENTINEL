import { useEffect, useState, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

export function useWebSocket(onMessage: (data: any) => void) {
  const [connected, setConnected] = useState(false);
  const [threatCount, setThreatCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log('Connected to Sentinel backend');
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('event', (data) => {
      onMessage({ type: 'event', payload: data });
      setThreatCount(prev => prev + 1);
    });

    socket.on('health', (data) => {
      onMessage({ type: 'health', payload: data });
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [onMessage]);

  return { connected, threatCount };
}
