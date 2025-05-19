import { useState, useEffect } from "react";
import API_URL from "../Constants.js";

// Login component
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // signin redirect logic
  const [redirectPath, setRedirectPath] = useState('/');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dest = params.get('redirect');
    
    // Check URL parameter first, then fall back to localStorage
    if (dest) {
      setRedirectPath(dest);
    } else {
      // Check if we have a stored redirect path
      const storedRedirect = localStorage.getItem('redirectAfterLogin');
      if (storedRedirect) {
        setRedirectPath(storedRedirect);
      }
    }
  }, []);

  // Use logo from public folder
  const logo = process.env.PUBLIC_URL + '/logo-ses-ai.svg';

  // Use explicit URL for authentication endpoint without redeclaring API_URL
  // var API_URL = 'http://0.0.0.0:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // sign‑up validation: no password, still only .edu
      // if (!isLogin && !email.endsWith('.edu')) {
      //   throw new Error('Only .edu e‑mail addresses are allowed for registration');
      // }

      const formData = new FormData();
      formData.append('username', username);

      if (isLogin) {
        formData.append('password', password);          // login path unchanged
      } else {
        // sign‑up: DO NOT send a password
        formData.append('email', email);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('organization_name', organizationName);
      }

      const response = await fetch(`${API_URL}/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        body: formData,
      });

      // --- richer error handling ---
      if (!response.ok) {
        let errorMsg = 'Authentication failed';
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

      if (isLogin) {
        // Store token and user info in localStorage
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('permissions', data.permissions);

        console.log("Stored local credentials.")

        // Clear the stored redirect path since we're about to use it
        localStorage.removeItem('redirectAfterLogin');

        // Navigate to the map page instead of just reloading
        window.location.replace(redirectPath);
      }
      else {
        alert(data.message || 'Verification e‑mail sent.');
        setIsLogin(true);             // return to Sign‑In view
        return;
      }
    }
    catch (err) {
      console.error('Authentication error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }               // nothing else to do
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt="SES AI Logo" className="auth-logo" />
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to access the Molecular Universe' : 'Join the Molecular Universe community'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
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
                <label htmlFor="organizationName">Organization Name</label>
                <input
                  type="text"
                  id="organizationName"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Organization Name"
                  required
                />
              </div>
            </>
          )}

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

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Email Address (academia only)</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Academic email address"
                required
              />
            </div>
          )}

          {isLogin && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <>
              <p>Don't have an account? <button onClick={() => setIsLogin(false)}>Sign Up</button></p>
              <p><a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/redeem'); window.location.reload(); }}>Redeem code for team members</a></p>
              <p>Forgot password? <a href="#" onClick={(e) => { e.preventDefault(); window.location.href = '/password-reset'; }}><strong>Reset</strong></a></p>
            </>
          ) : (
            <>
              <p>Already have an account? <button onClick={() => setIsLogin(true)}>Sign In</button></p>
              <p className="terms-text">
                By using Molecular Universe, you agree to SES AI's <a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/terms'); window.location.reload(); }} className="terms-link">Terms and Conditions</a>.
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default AuthPage;