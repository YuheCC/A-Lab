import { useEffect, useState } from 'react';
import './Login.less';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'umi';
import { redeemCode } from '@/services/auth';

// Redeem Code component for team members
const RedeemPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [voucher, setVoucher] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Use logo from public folder
  const logo = '/logo-ses-ai.svg';

  // Add useEffect to handle redirect after successful redemption
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response: any = await redeemCode({
        first_name: firstName,
        last_name: lastName,
        username: username,
        email: email,
        voucher: voucher,
      });

      // Rich error handling
      if (!response.ok) {
        
      }

      const data = await response.json();
      setSuccess(data.message || t('auth.redeem.messages.defaultSuccess'));

      // Clear form after successful submission
      setFirstName('');
      setLastName('');
      setUsername('');
      setEmail('');
      setVoucher('');
    }
    catch (err: any) {
        let errorMsg = err?.detail || t('auth.redeem.messages.defaultError');
        setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt={t('auth.logo.alt')} className="auth-logo" />
          <h2>{t('auth.redeem.header.title')}</h2>
          <p>{t('auth.redeem.header.subtitle')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="firstName">{t('auth.redeem.form.firstName')}</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t('auth.redeem.form.firstName')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">{t('auth.redeem.form.lastName')}</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t('auth.redeem.form.lastName')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">{t('auth.redeem.form.username')}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('auth.redeem.form.username')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('auth.redeem.form.email')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.redeem.form.emailPlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="voucher">{t('auth.redeem.form.teamCode')}</label>
            <input
              type="text"
              id="voucher"
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              placeholder={t('auth.redeem.form.teamCodePlaceholder')}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? t('auth.redeem.form.processing') : t('auth.redeem.form.redeemCode')}
          </button>
        </form>

        <div className="auth-switch">
          <p>{t('auth.redeem.switch.haveAccount')} <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>{t('auth.redeem.switch.signIn')}</a></p>
        </div>
      </div>
    </div>
  );
};

export default RedeemPage;