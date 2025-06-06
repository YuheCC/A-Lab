import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuthStore } from "../providers/auth.js";
import { getAPIUrl } from "../utils.js";

const API_URL = getAPIUrl();

// Login component
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { isLoading, login, register } = useAuthStore();

  // signin redirect logic
  const [searchParams] = useSearchParams();
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    setRedirectPath(
      searchParams.get('redirect') ?? 
      localStorage.getItem('redirectAfterLogin')
    );
  }, [searchParams]);

  // Use logo from public folder
  const logo = process.env.PUBLIC_URL + '/logo-ses-ai.svg';

  // Use explicit URL for authentication endpoint without redeclaring API_URL
  // var API_URL = 'http://0.0.0.0:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const response = await login({
        username,
        password
      });

      if (response.success) {
        // Clear the stored redirect path since we're about to use it
        localStorage.removeItem('redirectAfterLogin');
        if (redirectPath) navigate(redirectPath);
        else {
          // Return to home page
          navigate("/");
        }
        
      } else {
        console.error('Authentication error:', response.error);
        setError(response.error.toString());
      }

    } else {
      const response = await register({
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        organization_name: organizationName
      });

      if (!response.success) {
        console.error('Authentication error:', response.error);
        setError(response.error);
        return;
      }

      alert(response.message || 'Verification e‑mail sent.');
      setIsLogin(true);
      return;
    }

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
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <>
              <p>Don't have an account? <button onClick={() => setIsLogin(false)}>Sign Up</button></p>
              <p><a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/redeem'); window.location.reload(); }}>Redeem code for team members</a></p>
              <p>Forgot password? <a href="#" onClick={(e) => { e.preventDefault(); window.location.href = '/reset-password'; }}><strong>Reset</strong></a></p>
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