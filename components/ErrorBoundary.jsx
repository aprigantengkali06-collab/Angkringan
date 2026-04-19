import { Component } from "react";

/**
 * ErrorBoundary — tangkap runtime error per-screen tanpa crash seluruh app.
 * Kasir bisa tap "Coba Lagi" untuk reset screen tanpa reload penuh.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Screen crash:", error, info?.componentStack);
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { label = "Layar ini" } = this.props;
    const msg = this.state.error?.message || "Terjadi kesalahan tidak terduga";

    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "32px 24px", gap: 16, background: "var(--bg2)"
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(239,68,68,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none"
            stroke="var(--red)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text)", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
            {label} mengalami error
          </p>
          <p style={{
            color: "var(--muted)", fontSize: 12, lineHeight: 1.5,
            maxWidth: 260, margin: "0 auto",
            fontFamily: "monospace", wordBreak: "break-word"
          }}>
            {msg}
          </p>
        </div>

        <button
          onClick={() => this.reset()}
          style={{
            padding: "12px 28px", borderRadius: 12, border: "none",
            background: "var(--amber)", color: "#fff",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(245,158,11,0.25)"
          }}
        >
          Coba Lagi
        </button>

        <p style={{ color: "var(--muted)", fontSize: 11 }}>
          Jika terus berulang, muat ulang halaman aplikasi.
        </p>
      </div>
    );
  }
}
