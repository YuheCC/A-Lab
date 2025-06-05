import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

// Forgot Password component for password reset
const ForgotPasswordPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Use logo from public folder
  const logo = process.env.PUBLIC_URL + '/logo-ses-ai.svg';

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
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('email', email);

      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        body: formData,
      });

      // Rich error handling
      if (!response.ok) {
        let errorMsg = 'Password reset request failed';
        try {
          // Most FastAPI errors are JSON { detail: "…" }
          const dataErr = await response.clone().json();
          if (dataErr && dataErr.detail) errorMsg = dataErr.detail;
        } catch {
          try {
            // Fallback: plain‑text body
            const textErr = await response.text();
            if (textErr) errorMsg = textErr;
          } catch { /* ignore */ }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setSuccess(data.message || 'If your information matches our records, a password reset email will be sent.');

      // Clear form after successful submission
      setFirstName('');
      setLastName('');
      setEmail('');
    }
    catch (err) {
      console.error('Password reset request error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt="SES AI Logo" className="auth-logo" />
          <h2>Forgot Password</h2>
          <p>Enter your details to reset your password</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-switch">
          <p>Remembered your password? <a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/login'); window.location.reload(); }}>Sign In</a></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;