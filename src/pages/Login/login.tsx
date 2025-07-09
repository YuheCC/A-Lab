import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "umi";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/models/useAuth";


// Login component
const AuthPage = () => {
  const { t } = useTranslation();
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
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const redirectPath = searchParams.get('redirect') ?? localStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      setRedirectPath(redirectPath);
    }
  }, [searchParams]);

  // Use logo from public folder
  const logo = '/logo-ses-ai.svg';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
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

    } else {
      const response = await register({
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        organization_name: organizationName
      });

      if (!response.success) {
        const errorMessage = response.error.toString();
        const showMessage = errorMessage.includes('denied entity list') ? t('auth.messages.emailAddressDenied') : errorMessage;
        console.error('Authentication error:', showMessage);
        setError(showMessage);
        return;
      }

      alert(response.message || t('auth.messages.verificationSent'));
      setIsLogin(true);
      return;
    }

  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt={t('auth.logo.alt')} className="auth-logo" />
          <h2>{isLogin ? t('auth.header.welcomeBack') : t('auth.header.createAccount')}</h2>
          <p>{isLogin ? t('auth.header.signInSubtitle') : t('auth.header.signUpSubtitle')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
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
                <label htmlFor="organizationName">{t('auth.form.organizationName')}</label>
                <input
                  type="text"
                  id="organizationName"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder={t('auth.form.organizationName')}
                  required
                />
              </div>
            </>
          )}

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

          {!isLogin && (
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
          )}

          {isLogin && (
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
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? t('auth.form.processing') : isLogin ? t('auth.form.signIn') : t('auth.form.createAccount')}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <>
              <p>{t('auth.switch.noAccount')} <button onClick={() => setIsLogin(false)}>{t('auth.switch.signUp')}</button></p>
              <p><a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/redeem'); window.location.reload(); }}>{t('auth.switch.redeemCode')}</a></p>
              <p>{t('auth.switch.forgotPassword')} <a href="#" onClick={(e) => { e.preventDefault(); window.location.href = '/forgot-password'; }}><strong>{t('auth.switch.reset')}</strong></a></p>
            </>
          ) : (
            <>
              <p>{t('auth.switch.haveAccount')} <button onClick={() => setIsLogin(true)}>{t('auth.switch.signIn')}</button></p>
              <p className="terms-text">
                {t('auth.switch.termsText')} <a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/terms'); window.location.reload(); }} className="terms-link">{t('auth.switch.termsLink')}</a>.
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default AuthPage;