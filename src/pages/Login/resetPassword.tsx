import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'umi';
import { resetPasswordByToken } from '@/services/auth';

// Reset Password component
const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Use logo from public folder
  const logo = '/logo-ses-ai.svg';

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError(t('auth.resetPassword.messages.invalidLink'));
      return;
    }
    setToken(token);
  }, [searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError(t('auth.resetPassword.messages.passwordsNotMatch'));
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError(t('auth.resetPassword.messages.passwordTooShort'));
      return;
    }

    if (!token) {
      setError(t('auth.resetPassword.messages.invalidLink'));
      return;
    }

    setLoading(true);

    try {
      const response: any = await resetPasswordByToken({
        token: token,
        password: newPassword,
      });

      if (response.ok === false) {
        setError(response?.data?.detail || t('auth.resetPassword.messages.defaultError'));
        return;
      }

      setSuccess(t('auth.resetPassword.messages.defaultSuccess'));
      
      // Clear form
      setNewPassword('');
      setConfirmPassword('');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.detail || t('auth.resetPassword.messages.defaultError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt={t('auth.logo.alt')} className="auth-logo" />
          <h2>{t('auth.resetPassword.header.title')}</h2>
          <p>{t('auth.resetPassword.header.subtitle')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="newPassword">{t('auth.resetPassword.form.newPassword')}</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('auth.resetPassword.form.newPasswordPlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth.resetPassword.form.confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.resetPassword.form.confirmPasswordPlaceholder')}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || !token}
          >
            {loading ? t('auth.resetPassword.form.processing') : t('auth.resetPassword.form.resetPassword')}
          </button>
        </form>

        <div className="auth-switch">
          <p><a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>{t('auth.resetPassword.switch.backToLogin')}</a></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 