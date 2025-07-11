import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "umi";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/models/useAuth";

// Login component
const AuthPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { isLoading, login } = useAuthStore();

  // signin redirect logic
  const [searchParams] = useSearchParams();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const redirectPath = searchParams.get('redirect') ?? localStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      setRedirectPath(redirectPath);
    }
  }, [searchParams]);

  // Use logo from public folder
  const logo = '/logo-ses-ai.svg';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const response: any = await login({
      username,
      password
    });

    console.log(response)
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
      if(response.error) setError(response.error.toString());
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt={t('auth.logo.alt')} className="auth-logo" />
          <h2>{t('auth.header.welcomeBack')}</h2>
          <p>{t('auth.header.signInSubtitle')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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
            <label htmlFor="password">{t('auth.form.password')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.form.password')}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? t('auth.form.processing') : t('auth.form.signIn')}
          </button>
        </form>

        <div className="auth-switch">
          <p>{t('auth.switch.noAccount')} <button onClick={() => navigate('/register')}>{t('auth.switch.signUp')}</button></p>
          <p>{t('auth.switch.forgotPassword')} <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}><strong>{t('auth.switch.reset')}</strong></a></p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;