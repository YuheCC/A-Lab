import { useState } from "react";
import { useNavigate } from "umi";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/models/useAuth";

// Register component
const RegisterPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const navigate = useNavigate();
  const { isLoading, register } = useAuthStore();

  // Use logo from public folder
  const logo = '/logo-ses-ai.svg';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('auth.form.passwordsDoNotMatch'));
      return;
    }
    
    setError('');

    const response = await register({
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      password,
      organization_name: organizationName
    })

    if (!response.success) {
      const errorMessage = response.message?.toString() || '';
      const showMessage = errorMessage.includes('denied entity list') ? t('auth.messages.emailAddressDenied') : errorMessage;
      console.error('Authentication error:', showMessage);
      setError(showMessage);
      return;
    }

    alert(response.message || t('auth.messages.verificationSent'));
    navigate('/verify-code?id=' + response.data.verify_id);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt={t('auth.logo.alt')} className="auth-logo" />
          <h2>{t('auth.header.createAccount')}</h2>
          <p>{t('auth.header.signUpSubtitle')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="firstName">{t('auth.form.firstName')}</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t('auth.form.firstName')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">{t('auth.form.lastName')}</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t('auth.form.lastName')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">{t('auth.form.username')}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('auth.form.username')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('auth.form.email')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.form.emailPlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.form.password')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.form.passwordPlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth.form.confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.form.confirmPasswordPlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="organizationName">{t('auth.form.organizationName')}</label>
            <input
              type="text"
              id="organizationName"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder={t('auth.form.organizationName')}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? t('auth.form.processing') : t('auth.form.createAccount')}
          </button>
        </form>

        <div className="auth-switch">
          <p>{t('auth.switch.haveAccount')} <button onClick={() => navigate('/login')}>{t('auth.switch.signIn')}</button></p>
          <p className="terms-text">
            {t('auth.switch.termsText')} <a href="#" onClick={(e) => { e.preventDefault(); navigate('/terms'); }} className="terms-link">{t('auth.switch.termsLink')}</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
