import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "umi";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/models/useAuth";

const VerifyForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [id, setId] = useState('');
  
  const navigate = useNavigate();
  const { isLoading, verifyForgotPassword } = useAuthStore();

  // 从URL获取id参数
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setId(idParam);
    } else {
      setError(t('auth.verifyForgotPassword.messages.invalidLink'));
    }
  }, [searchParams, t]);

  // 使用logo from public folder
  const logo = '/logo-ses-ai.svg';

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允许数字输入，最多6位
    if (/^\d{0,6}$/.test(value)) {
      setCode(value);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      setError(t('auth.verifyForgotPassword.messages.invalidLink'));
      return;
    }

    if (!code) {
      setError(t('auth.verifyForgotPassword.messages.invalidCode'));
      return;
    }

    if (code.length !== 6) {
      setError(t('auth.verifyForgotPassword.messages.invalidCode'));
      return;
    }

    setError('');

    try {
      const response = await verifyForgotPassword({ verify_id: id, code });
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorMessage = response.message?.toString() || '';
        if (errorMessage.includes('expired')) {
          setError(t('auth.verifyForgotPassword.messages.expired'));
        } else if (errorMessage.includes('invalid')) {
          setError(t('auth.verifyForgotPassword.messages.failed'));
        } else {
          setError(errorMessage || t('auth.verifyForgotPassword.messages.failed'));
        }
      }
    } catch (err) {
      setError(t('auth.verifyForgotPassword.messages.failed'));
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <img src={logo} alt={t('auth.logo.alt')} className="auth-logo" />
            <h2>{t('auth.verifyForgotPassword.messages.success')}</h2>
            <p>{t('auth.verifyForgotPassword.messages.redirecting')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt={t('auth.logo.alt')} className="auth-logo" />
          <h2>{t('auth.verifyForgotPassword.header.title')}</h2>
          <p>{t('auth.verifyForgotPassword.header.subtitle')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="code">{t('auth.verifyForgotPassword.form.code')}</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={handleCodeChange}
              placeholder={t('auth.verifyForgotPassword.form.codePlaceholder')}
              maxLength={6}
              className="code-input"
              style={{
                fontSize: '24px',
                letterSpacing: '8px',
                textAlign: 'center',
                fontFamily: 'monospace'
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading || !code || code.length !== 6}
          >
            {isLoading ? t('auth.verifyForgotPassword.form.processing') : t('auth.verifyForgotPassword.form.verify')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            <button 
              type="button" 
              onClick={() => navigate('/login')}
              className="auth-link"
            >
              {t('auth.verifyForgotPassword.switch.backToLogin')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyForgotPasswordPage; 