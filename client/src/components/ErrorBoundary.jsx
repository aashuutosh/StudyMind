import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("StudyMind Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "monospace"
        }}>
          <div style={{
            background: "#1e1b4b",
            border: "1px solid #4c1d95",
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "600px",
            width: "100%"
          }}>
            <h2 style={{ color: "#f87171", marginTop: 0 }}>⚠️ Render Error</h2>
            <pre style={{
              color: "#fca5a5",
              fontSize: "13px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "#0f172a",
              padding: "1rem",
              borderRadius: "8px"
            }}>
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                marginTop: "1rem",
                background: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0.5rem 1.5rem",
                cursor: "pointer"
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
