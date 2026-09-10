import { StrictMode, ReactNode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", fontFamily: "sans-serif", textAlign: "center" }}>
          <h2>Application Loading Error</h2>
          <p style={{ color: "#e53e3e" }}>{this.state.error?.toString()}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: "10px 20px", borderRadius: "8px", background: "#2F80ED", color: "#fff", border: "none", cursor: "pointer" }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Register service worker for Progressive Web App (PWA) installation
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration fallback
    });
  });
}


