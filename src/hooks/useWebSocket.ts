import { useEffect, useRef, useState, useCallback } from 'react';

export interface WsProgressMessage {
  type: 'progress' | 'stage' | 'log' | 'status' | 'complete' | 'failed' | 'paused' | 'resumed';
  jobId: string;
  progress?: number;
  stage?: string;
  file?: string;
  speed?: string;
  log?: string;
  message?: string;
  data?: any;
}

export function useWebSocket(jobId?: string, workspaceId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WsProgressMessage | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!jobId && !workspaceId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' ? 'localhost:4000' : window.location.host;
    const queryParams = new URLSearchParams();
    if (jobId) queryParams.set('jobId', jobId);
    if (workspaceId) queryParams.set('workspaceId', workspaceId);

    const wsUrl = `${protocol}//${host}/ws/migration?${queryParams.toString()}`;

    try {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const parsed: WsProgressMessage = JSON.parse(event.data);
          setLastMessage(parsed);

          if (parsed.log) {
            setLogs((prev) => [...prev.slice(-100), `[${new Date().toLocaleTimeString()}] ${parsed.log}`]);
          }
        } catch {
          // Ignore non-json frames
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
      };

      socket.onerror = () => {
        setIsConnected(false);
      };

      wsRef.current = socket;
    } catch {
      setIsConnected(false);
    }
  }, [jobId, workspaceId]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const clearLogs = () => setLogs([]);

  return { isConnected, lastMessage, logs, clearLogs };
}
