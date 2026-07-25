import { useEffect, useRef, useState } from 'react';
import apiClient from '../services/http/apiClient';

export interface WsProgressMessage {
  event?: string;
  type?: 'progress' | 'stage' | 'log' | 'status' | 'complete' | 'failed' | 'paused' | 'resumed';
  jobId: string;
  status?: string;
  stage?: string;
  progress?: number;
  processedFiles?: number;
  totalFiles?: number;
  message?: string;
  file?: string;
  speed?: string;
  log?: string;
  data?: any;
}

export function useWebSocket(jobId?: string, workspaceId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WsProgressMessage | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let attempt = 0;

    const createSocket = () => {
      if (!jobId && !workspaceId) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname === 'localhost' ? 'localhost:4000' : window.location.host;
      const queryParams = new URLSearchParams();
      if (jobId) queryParams.set('jobId', jobId);
      if (workspaceId) queryParams.set('workspaceId', workspaceId);

      const wsUrl = `${protocol}//${host}/ws/migration?${queryParams.toString()}`;

      try {
        const socket = new WebSocket(wsUrl);

        socket.onopen = async () => {
          setIsConnected(true);
          attempt = 0;

          // Fetch latest job state from REST API on connect/reconnect as source of truth
          if (jobId) {
            try {
              const res: any = await apiClient.get(`/api/migrations/${jobId}`);
              if (res.success && res.job) {
                setLastMessage({
                  event: `job.${res.job.status.toLowerCase()}`,
                  jobId: res.job.id,
                  status: res.job.status,
                  stage: res.job.stage || res.job.currentStage || res.job.status,
                  progress: res.job.progress ?? 0,
                  message: res.job.message || 'Connected to live migration stream.',
                  data: res.job.result,
                });
              }
            } catch {
              // Ignore fetch error
            }
          }
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
          attempt++;
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          reconnectTimeout = setTimeout(createSocket, delay);
        };

        socket.onerror = () => {
          setIsConnected(false);
        };

        wsRef.current = socket;
      } catch {
        setIsConnected(false);
      }
    };

    createSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [jobId, workspaceId]);

  const clearLogs = () => setLogs([]);

  return { isConnected, lastMessage, logs, clearLogs };
}
