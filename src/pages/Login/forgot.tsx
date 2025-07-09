import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { forgotPassword } from '@/services/auth';

// Forgot Password component for password reset
const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Use logo from public folder
  const logo = '/logo-ses-ai.svg';

  // Add useEffect to redirect after successful password reset request
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        window.history.pushState({}, '', '/login');
        window.location.reload();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response: any = await forgotPassword({
        first_name: firstName,
        last_name: lastName,
        email: email,
      });

      setSuccess(response.message || t('auth.forgotPassword.messages.defaultSuccess'));

      // Clear form after successful submission
      setFirstName('');
      setLastName('');
      setEmail('');
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
          <p>{t('auth.forgotPassword.header.subtitle')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="firstName">{t('auth.forgotPassword.form.firstName')}</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t('auth.forgotPassword.form.firstName')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">{t('auth.forgotPassword.form.lastName')}</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t('auth.forgotPassword.form.lastName')}
              required
            />
          </div>

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
            {loading ? t('auth.forgotPassword.form.processing') : t('auth.forgotPassword.form.resetPassword')}
          </button>
        </form>

        <div className="auth-switch">
          <p>{t('auth.forgotPassword.switch.rememberedPassword')} <a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/login'); window.location.reload(); }}>{t('auth.forgotPassword.switch.signIn')}</a></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;