// ── Structured Logger ─────────────────────────────────────────────────────────
// Provides levelled logging (info / warn / error), session trace-ID tracking,
// an in-memory ring buffer for diagnostics, and a one-click log-download helper.

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  traceId: string;
  context?: unknown;
}

const MAX_ENTRIES = 100;
let buffer: LogEntry[] = [];

// ── Trace ID ────────────────────────────────────────────────────────────────

function newId(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

let _sessionTraceId: string = newId();

// ── Internal writer ─────────────────────────────────────────────────────────

function write(level: LogLevel, message: string, context?: unknown) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    traceId: _sessionTraceId,
    context,
  };

  buffer.push(entry);
  if (buffer.length > MAX_ENTRIES) buffer.shift();

  if (import.meta.env.DEV) {
    const styles: Record<LogLevel, string> = {
      info:  'color:#38BDF8;font-weight:bold',
      warn:  'color:#FBBF24;font-weight:bold',
      error: 'color:#F87171;font-weight:bold',
    };
    console.log(
      `%c[${entry.timestamp}] [${level.toUpperCase()}] [trace:${entry.traceId}] ${message}`,
      styles[level],
      context ?? '',
    );
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export const logger = {
  // Current session trace ID (send with every API call)
  getTraceId(): string {
    return _sessionTraceId;
  },

  // Rotate the trace ID (e.g. after login / logout)
  rotateTraceId(): string {
    _sessionTraceId = newId();
    return _sessionTraceId;
  },

  info(message: string, context?: unknown): void {
    write('info', message, context);
  },

  warn(message: string, context?: unknown): void {
    write('warn', message, context);
  },

  error(message: string | Error, context?: unknown): void {
    if (message instanceof Error) {
      write('error', message.message, { stack: message.stack, ...((context as object) ?? {}) });
    } else {
      write('error', message, context);
    }
  },

  getLogs(): LogEntry[] {
    return [...buffer];
  },

  clearLogs(): void {
    buffer = [];
  },

  /** Downloads the current log buffer as a pretty-printed JSON file. */
  downloadLogs(): void {
    try {
      const blob = new Blob([JSON.stringify(buffer, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), {
        href:     url,
        download: `migration_studio_logs_${Date.now()}.json`,
      });
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[logger] Failed to download logs', err);
    }
  },
} as const;
