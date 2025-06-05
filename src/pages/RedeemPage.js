import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

// Redeem Code component for team members
const RedeemPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [voucher, setVoucher] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Use logo from public folder
  const logo = process.env.PUBLIC_URL + '/logo-ses-ai.svg';

  // Add useEffect to handle redirect after successful redemption
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        window.history.pushState({}, '', '/');
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
      formData.append('username', username);
      formData.append('email', email);
      formData.append('voucher', voucher);

      const response = await fetch(`${API_URL}/redeem`, {
        method: 'POST',
        body: formData,
      });

      // Rich error handling
      if (!response.ok) {
        let errorMsg = 'Voucher redemption failed';
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
      setSuccess(data.message || 'Account created successfully. Check your inbox for a temporary password.');

      // Clear form after successful submission
      setFirstName('');
      setLastName('');
      setUsername('');
      setEmail('');
      setVoucher('');
    }
    catch (err) {
      console.error('Redemption error:', err);
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
          <h2>Redeem Team Code</h2>
          <p>Join your team on the Molecular Universe platform</p>
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
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
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

          <div className="form-group">
            <label htmlFor="voucher">Team Code</label>
            <input
              type="text"
              id="voucher"
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              placeholder="Enter your team code"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Redeem Code'}
          </button>
        </form>

        <div className="auth-switch">
          <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/login'); window.location.reload(); }}>Sign In</a></p>
        </div>
      </div>
    </div>
  );
};

export default RedeemPage;