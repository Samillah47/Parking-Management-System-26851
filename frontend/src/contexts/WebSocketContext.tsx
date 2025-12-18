/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

interface SpotUpdate {
  spotId: number;
  spotNumber: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

// Define allowed outgoing message types to the WebSocket server
interface WebSocketOutgoingMessage {
  type: string;
  [key: string]: unknown; // allows any additional fields per message type
}

interface WebSocketContextType {
  spotUpdates: SpotUpdate[];
  isConnected: boolean;
  sendMessage: (message: WebSocketOutgoingMessage) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [spotUpdates, setSpotUpdates] = useState<SpotUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const wsUrl = `ws://localhost:8080/ws?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'spot_update') {
          const update: SpotUpdate = {
            spotId: data.spotId,
            spotNumber: data.spotNumber,
            status: data.status,
          };
          setSpotUpdates((prev) => [...prev, update]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isAuthenticated, token]);

  const sendMessage = (message: WebSocketOutgoingMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        spotUpdates,
        isConnected,
        sendMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}