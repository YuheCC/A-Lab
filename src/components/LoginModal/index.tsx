import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "umi";
import { useTranslation } from "react-i18next";
import { X } from 'lucide-react';
import { useAuthStore } from "@/models/useAuth";
import './LoginModal.less';
import { PricingContext } from "@/layouts";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string;
  onLogin?: () => void;
}

const LoginModal = ({ isOpen, onClose, redirectPath, onLogin }: LoginModalProps) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const navigate = useNavigate();
  const { isLoading, login } = useAuthStore();
  const pricingContext = useContext(PricingContext);
  
  // Refs for focus management
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Use logo from public folder
  const logo = '/logo-ses-ai.svg';

  // Reset form when modal opens and handle auto focus
  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setError('');
      setAgreeToTerms(false);
      
      // Auto focus to username input after modal animation
      const timer = setTimeout(() => {
        if (usernameInputRef.current) {
          usernameInputRef.current.focus();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      // Restore body scroll
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreeToTerms) {
      setError(t('auth.form.termsRequired'));
      return;
    }

    const response: any = await login({
      username,
      password
    });

    if (response.success) {
      onClose();

      // 调用登录成功回调
      if (onLogin) {
        onLogin();
      }

      // Navigate to redirect path or default to map
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate("/map");
      }
    } else {
      console.error('Authentication error:', response.message);
      if (response.message) setError(response.message.toString());
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleRegisterClick = () => {
    onClose();
    navigate('/register');
  };

  const handleForgotPasswordClick = () => {
    onClose();
    navigate('/forgot-password');
  };

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Open terms in new tab to avoid closing the modal
    window.open('/terms', '_blank');
  };

  // Handle focus trap for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay">
      <div 
        className="login-modal"
        ref={modalRef}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <div className="login-modal-header">
          <button 
            className="login-modal-close"
            onClick={handleClose}
            disabled={isLoading}
            aria-label={t('common.close', 'Close')}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="login-modal-body">
          <div className="login-modal-auth-header">
            <img src={logo} alt={t('auth.logo.alt')} className="login-modal-logo" />
            <p>{t('auth.header.signInSubtitle')}</p>
          </div>

          {error && <div className="login-modal-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-modal-form">
            <div className="login-modal-form-group">
              <label htmlFor="username">{t('auth.form.username')}</label>
              <input
                ref={usernameInputRef}
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('auth.form.username')}
                required
                disabled={isLoading}
              />
            </div>

            <div className="login-modal-form-group">
              <label htmlFor="password">{t('auth.form.password')}</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.form.password')}
                required
                disabled={isLoading}
              />
            </div>

            <div className="login-modal-form-group login-modal-terms-checkbox">
              <label className="login-modal-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                  disabled={isLoading}
                />
                <span className="login-modal-terms-text">
                  {t('auth.switch.loginTermsText')} <a 
                    href="#" 
                    onClick={handleTermsClick} 
                    className="login-modal-terms-link"
                  >
                    {t('auth.switch.loginTermsLink')}
                  </a>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="login-modal-submit-button"
              disabled={isLoading}
            >
              {isLoading ? t('auth.form.processing') : t('auth.form.signIn')}
            </button>
          </form>

          <div className="login-modal-switch">
            <p>
              {t('auth.switch.noAccount')} 
              <button 
                onClick={handleRegisterClick} 
                disabled={isLoading}
                className="login-modal-link-button"
              >
                {t('auth.switch.signUp')}
              </button>
            </p>
            <p>
              {t('auth.switch.forgotPassword')} 
              <button 
                onClick={handleForgotPasswordClick} 
                disabled={isLoading}
                className="login-modal-link-button"
              >
                {t('auth.switch.reset')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
