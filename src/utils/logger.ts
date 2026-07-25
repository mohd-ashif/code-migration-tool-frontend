export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  traceId?: string;
}

class Logger {
  private buffer: LogEntry[] = [];
  private maxEntries = 100;
  private traceId = `trace_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  public getTraceId(): string {
    return this.traceId;
  }

  public info(message: string, data?: any, traceId?: string) {
    this.addLog('INFO', message, data, traceId || this.traceId);
  }

  public warn(message: string, data?: any, traceId?: string) {
    this.addLog('WARN', message, data, traceId || this.traceId);
  }

  public error(message: string, data?: any, traceId?: string) {
    this.addLog('ERROR', message, data, traceId || this.traceId);
  }

  private addLog(level: LogLevel, message: string, data?: any, traceId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      traceId,
    };

    this.buffer.push(entry);
    if (this.buffer.length > this.maxEntries) {
      this.buffer.shift();
    }

    const consoleFn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
    consoleFn(`[${entry.timestamp}] [${level}] [${entry.traceId}] ${message}`, data || '');
  }

  public getLogs(): LogEntry[] {
    return [...this.buffer];
  }

  public clearLogs() {
    this.buffer = [];
  }
}

export const logger = new Logger();
