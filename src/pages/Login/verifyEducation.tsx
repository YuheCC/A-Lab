import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "umi";
import { useTranslation } from "react-i18next";
import { verifyEducationCode } from "@/services/auth";

const VerifyEducationPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [id, setId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // 从URL获取email参数
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setId(decodeURIComponent(idParam));
    } else {
      setError(t('auth.verifyEducation.messages.invalidLink'));
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
      setError(t('auth.verifyEducation.messages.invalidLink'));
      return;
    }

    if (!code) {
      setError(t('auth.verifyEducation.messages.invalidCode'));
      return;
    }

    if (code.length !== 6) {
      setError(t('auth.verifyEducation.messages.invalidCode'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response: any = await verifyEducationCode({ 
        verify_id: id, 
        code: code 
      });
      
      if (response.ok !== false) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        const errorMsg = response.data?.detail || '';
        if (errorMsg.includes('expired')) {
          setError(t('auth.verifyEducation.messages.expired'));
        } else if (errorMsg.includes('invalid')) {
          setError(t('auth.verifyEducation.messages.failed'));
        } else {
          setError(errorMsg || t('auth.verifyEducation.messages.failed'));
        }
      }
    } catch (err: any) {
      setError(err.detail || t('auth.verifyEducation.messages.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <img src={logo} alt={t('auth.logo.alt')} className="auth-logo" />
            <h2>{t('auth.verifyEducation.messages.success')}</h2>
            <p>{t('auth.verifyEducation.messages.redirecting')}</p>
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
          <h2>{t('auth.verifyEducation.header.title')}</h2>
          <p>{t('auth.verifyEducation.header.subtitle')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="code">{t('auth.verifyEducation.form.code')}</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={handleCodeChange}
              placeholder={t('auth.verifyEducation.form.codePlaceholder')}
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
            {isLoading ? t('auth.verifyEducation.form.processing') : t('auth.verifyEducation.form.verify')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="auth-link"
            >
              {t('auth.verifyEducation.switch.backToSettings')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEducationPage; 