import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authFetch, getAPIUrl } from '../utils';
import { useNavigate } from 'react-router';

const API_URL = getAPIUrl();

const PasswordReset = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Use logo from public folder
  const logo = process.env.PUBLIC_URL + '/logo-ses-ai.svg';

  // Add useEffect to redirect after successful password reset
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordReset.messages.passwordsNotMatch'));
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError(t('auth.passwordReset.messages.passwordTooShort'));
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('current_password', currentPassword);
      formData.append('new_password', newPassword);

      const response = await authFetch(`${API_URL}/reset-password`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = t('auth.passwordReset.messages.defaultError');
        try {
          const dataErr = await response.clone().json();
          if (dataErr && dataErr.detail) errorMsg = dataErr.detail;
        } catch {
          try {
            const textErr = await response.text();
            if (textErr) errorMsg = textErr;
          } catch { /* ignore */ }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setSuccess(data.message || t('auth.passwordReset.messages.defaultSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ overflow: 'auto', padding: '40px 0' }}>
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt={t('auth.logo.alt')} className="auth-logo" />
          <h2>{t('auth.passwordReset.header.title')}</h2>
          <p>{t('auth.passwordReset.header.subtitle')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="currentPassword">{t('auth.passwordReset.form.currentPassword')}</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t('auth.passwordReset.form.currentPasswordPlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">{t('auth.passwordReset.form.newPassword')}</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('auth.passwordReset.form.newPasswordPlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth.passwordReset.form.confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.passwordReset.form.confirmPasswordPlaceholder')}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? t('auth.passwordReset.form.processing') : t('auth.passwordReset.form.resetPassword')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;