// ── Global Error Boundary ─────────────────────────────────────────────────────
// Class-based React error boundary that wraps the entire app and renders a
// premium glassmorphic fallback UI on unhandled render errors. Provides:
//   • Error summary & stack trace display
//   • "Reload Page" one-click recovery
//   • "Clear Cache & Reload" to nuke localStorage / sessionStorage
//   • Log download button for support diagnosis

import React from 'react';
import { logger } from '../../utils/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    logger.error(error, { componentStack: errorInfo.componentStack });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore storage access errors
    }
    window.location.reload();
  };

  private handleDownloadLogs = () => {
    logger.downloadLogs();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, errorInfo } = this.state;

    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#07070C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glows */}
        <div
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(124,108,255,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(248,113,113,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Card */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: 560,
            width: '100%',
            background: 'rgba(18,19,31,0.85)',
            border: '1px solid rgba(248,113,113,0.25)',
            borderRadius: 24,
            backdropFilter: 'blur(24px)',
            padding: '36px 40px',
            boxShadow: '0 0 60px rgba(248,113,113,0.08), 0 32px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Icon + heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div
              style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(248,113,113,0.12)',
                border: '1px solid rgba(248,113,113,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, flexShrink: 0,
              }}
            >
              ⚠️
            </div>
            <div>
              <h1
                style={{
                  margin: 0, fontSize: 18, fontWeight: 700,
                  color: '#FFFFFF', letterSpacing: '-0.02em',
                }}
              >
                Something went wrong
              </h1>
              <p
                style={{
                  margin: '2px 0 0', fontSize: 13, color: '#71717A',
                  fontWeight: 400,
                }}
              >
                An unexpected render error occurred in the application.
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                background: 'rgba(248,113,113,0.05)',
                border: '1px solid rgba(248,113,113,0.15)',
                borderRadius: 12, padding: '12px 16px', marginBottom: 20,
              }}
            >
              <p
                style={{
                  margin: 0, fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12, color: '#FCA5A5', wordBreak: 'break-word',
                  lineHeight: 1.6,
                }}
              >
                {error.message}
              </p>
            </div>
          )}

          {/* Stack trace (collapsed) */}
          {errorInfo?.componentStack && (
            <details
              style={{ marginBottom: 24 }}
            >
              <summary
                style={{
                  fontSize: 11, color: '#52525B', cursor: 'pointer',
                  userSelect: 'none', fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 8, letterSpacing: '0.05em',
                }}
              >
                COMPONENT STACK TRACE ▾
              </summary>
              <pre
                style={{
                  fontSize: 10, color: '#3F3F46', overflowX: 'auto',
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1.6, maxHeight: 180, overflowY: 'auto',
                  background: 'rgba(0,0,0,0.3)', borderRadius: 8,
                  padding: '10px 12px', margin: 0,
                }}
              >
                {errorInfo.componentStack}
              </pre>
            </details>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={this.handleReload}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 12,
                border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #7C6CFF 0%, #A68CFF 100%)',
                color: '#ffffff', fontSize: 13, fontWeight: 600,
                letterSpacing: '-0.01em',
                boxShadow: '0 0 24px rgba(124,108,255,0.25)',
                transition: 'opacity 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              🔄 Reload Application
            </button>

            <button
              onClick={this.handleClearReload}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 12,
                border: '1px solid rgba(124,108,255,0.2)', cursor: 'pointer',
                background: 'rgba(124,108,255,0.07)', color: '#A68CFF',
                fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
                transition: 'background 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(124,108,255,0.13)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(124,108,255,0.07)')}
            >
              🗑️ Clear Cache & Reload
            </button>

            <button
              onClick={this.handleDownloadLogs}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                background: 'transparent', color: '#52525B',
                fontSize: 12, fontWeight: 500, letterSpacing: '-0.01em',
                transition: 'color 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#A1A1AA')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#52525B')}
            >
              ⬇ Download Diagnostic Logs
            </button>
          </div>

          {/* Footer */}
          <p
            style={{
              marginTop: 24, marginBottom: 0, fontSize: 11,
              color: '#3F3F46', textAlign: 'center',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            migration studio · trace: {logger.getTraceId()}
          </p>
        </div>
      </div>
    );
  }
}
