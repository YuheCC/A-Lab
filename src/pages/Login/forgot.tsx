import { useState } from 'react';
import './Login.less';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'umi';
import { sendForgotPasswordCode } from '@/services/auth';

// Forgot Password component for password reset
const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Use logo from public folder
  const logo = '/logo-ses-ai.svg';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response: any = await sendForgotPasswordCode({
        email: email,
      });

      if(response.ok === false) {
        setError(response?.data?.detail || t('auth.forgotPassword.messages.defaultError'));
        return;
      }

      // Clear form after successful submission
      setEmail('');
      
      // Show success message with instructions
      setSuccess(t('auth.forgotPassword.messages.resetLinkSent'));
    }
    catch (err: any) {
      console.error('Password reset request error:', err);
      setError(err.detail || t('auth.forgotPassword.messages.defaultError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt={t('auth.logo.alt')} className="auth-logo" />
          <h2>{t('auth.forgotPassword.header.title')}</h2>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('auth.forgotPassword.form.email')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.forgotPassword.form.emailPlaceholder')}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? t('auth.forgotPassword.form.processing') : t('auth.forgotPassword.form.sendResetPassword')}
          </button>
        </form>

        <div className="auth-switch">
          <p>{t('auth.forgotPassword.switch.rememberedPassword')} <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>{t('auth.forgotPassword.switch.signIn')}</a></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;