import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, RefreshCw, ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import './index.less';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReload={this.handleReload} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error?: Error; onReload: () => void }> = ({ error, onReload }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="error-boundary-fallback">
      <div className="error-boundary-content">
        <div className="error-boundary-icon">
          <div className="icon-wrapper">
            <AlertCircle size={48} strokeWidth={2} />
          </div>
        </div>

        <h1 className="error-boundary-title">{t('common.errorBoundary.title')}</h1>
        <p className="error-boundary-message">{t('common.errorBoundary.message')}</p>

        {error && (
          <div className="error-boundary-error-section">
            <button
              className="error-boundary-details-toggle"
              onClick={() => setShowDetails(!showDetails)}
            >
              <span className="toggle-label">
                <Terminal size={16} />
                {t('common.errorBoundary.details')}
              </span>
              {showDetails ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            <div className={`error-boundary-details-container ${showDetails ? 'is-open' : ''}`}>
              <div className="error-boundary-details">
                <div className="details-header">
                  <span>ERROR LOG</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                <code>{error.toString()}</code>
                {error.stack && (
                  <pre className="error-boundary-stack">{error.stack}</pre>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="error-boundary-actions">
          <button className="error-boundary-reload-btn" onClick={onReload}>
            <RefreshCw size={18} />
            {t('common.errorBoundary.reload')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
