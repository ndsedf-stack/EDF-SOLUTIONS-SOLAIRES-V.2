import React, { Component, ErrorInfo, ReactNode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("💥 Uncaught error in React tree:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", backgroundColor: "#09090b", color: "#f87171", fontFamily: "sans-serif", minHeight: "100vh" }}>
          <h1 style={{ color: "#ef4444", fontSize: "24px", marginBottom: "16px" }}>⚠️ Une erreur est survenue dans l'application</h1>
          <div style={{ backgroundColor: "#18181b", padding: "20px", borderRadius: "8px", border: "1px solid #ef4444", color: "#fca5a5" }}>
            <p style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "8px" }}>
              {this.state.error?.name}: {this.state.error?.message}
            </p>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px", color: "#a1a1aa" }}>
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);
