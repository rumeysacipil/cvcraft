import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useLangStore } from '../store/langStore'
import { translations } from '../i18n/translations'


/* ─── Password Strength ────────────────────────────────────────────────────── */
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { score, label: 'Zayıf / Weak', color: '#ef4444', pct: 20 }
  if (score <= 2) return { score, label: 'Orta / Fair', color: '#f59e0b', pct: 40 }
  if (score <= 3) return { score, label: 'İyi / Good', color: '#3b82f6', pct: 65 }
  return { score, label: 'Güçlü / Strong', color: '#10b981', pct: 100 }
}

/* ─── Eye Toggle Button ────────────────────────────────────────────────────── */
function EyeButton({ show, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
      fontSize: '16px', padding: '2px', lineHeight: 1, display: 'flex', alignItems: 'center'
    }} title={show ? 'Gizle / Hide' : 'Göster / Show'}>
      {show ? '🙈' : '👁'}
    </button>
  )
}

/* ─── Shared Styles ──────────────────────────────────────────────────────────*/
const AUTH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  .auth-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 40%, #dbeafe 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', -apple-system, sans-serif;
    position: relative;
    overflow: hidden;
  }

  .auth-page::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
    top: -200px; right: -200px;
    border-radius: 50%;
  }

  .auth-page::after {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%);
    bottom: -100px; left: -100px;
    border-radius: 50%;
  }

  .auth-topbar {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.8);
    z-index: 10;
  }

  .auth-logo {
    font-size: 20px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .auth-logo-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #4f46e5, #2563eb);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 14px; font-weight: 800;
  }

  .auth-topbar-right {
    display: flex; align-items: center; gap: 10px;
  }

  .auth-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 40px 44px;
    width: 420px;
    box-shadow: 0 8px 40px rgba(79,70,229,0.12), 0 2px 8px rgba(0,0,0,0.04);
    position: relative;
    z-index: 1;
    margin-top: 60px;
    animation: authSlideUp 0.5s ease-out;
  }

  @media (max-width: 480px) {
    .auth-card { width: calc(100vw - 32px); padding: 28px 24px; }
  }

  @keyframes authSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .auth-card-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
  }

  .auth-cv-illustration {
    width: 72px; height: 88px;
    background: linear-gradient(145deg, #f0f4ff, #e8edff);
    border-radius: 10px;
    position: relative;
    box-shadow: 0 4px 20px rgba(79,70,229,0.15);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 5px; padding: 12px;
  }

  .auth-cv-line {
    width: 100%; height: 5px;
    border-radius: 3px;
    background: #c7d2fe;
  }

  .auth-cv-line.dark { background: #6366f1; width: 60%; }

  .auth-cv-check {
    position: absolute;
    bottom: -10px; right: -10px;
    width: 28px; height: 28px;
    background: linear-gradient(135deg, #10b981, #34d399);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 14px; font-weight: 800;
    border: 3px solid white;
  }

  .auth-heading {
    font-size: 26px;
    font-weight: 800;
    color: #1e293b;
    text-align: center;
    margin-bottom: 6px;
    letter-spacing: -0.5px;
    line-height: 1.25;
  }

  .auth-subheading {
    text-align: center;
    color: #64748b;
    font-size: 14px;
    margin-bottom: 28px;
    line-height: 1.5;
  }

  .auth-google-btn {
    width: 100%;
    padding: 12px;
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    gap: 10px;
    transition: all 0.2s;
    margin-bottom: 20px;
  }

  .auth-google-btn:hover {
    background: #f8fafc;
    border-color: #c7d2fe;
    box-shadow: 0 2px 8px rgba(79,70,229,0.1);
    transform: translateY(-1px);
  }

  .auth-divider {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px;
    color: #94a3b8; font-size: 12px; font-weight: 500;
  }

  .auth-divider::before, .auth-divider::after {
    content: '';
    flex: 1; height: 1px; background: #e2e8f0;
  }

  .auth-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 6px;
    letter-spacing: 0.2px;
  }

  .auth-char-count {
    font-size: 11px;
    font-weight: 400;
    color: #94a3b8;
  }

  .auth-input-wrap {
    position: relative;
    margin-bottom: 14px;
  }

  .auth-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #1e293b;
    background: #f8fafc;
    outline: none;
    box-sizing: border-box;
    transition: all 0.2s;
  }

  .auth-input.has-eye {
    padding-right: 42px;
  }

  .auth-input:focus {
    border-color: #6366f1;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }

  .auth-input.error {
    border-color: #fca5a5;
    background: #fff5f5;
  }

  .auth-strength-bar {
    height: 4px;
    border-radius: 2px;
    background: #e2e8f0;
    margin-top: 6px;
    overflow: hidden;
  }

  .auth-strength-fill {
    height: 100%;
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  .auth-strength-label {
    font-size: 11px;
    font-weight: 600;
    margin-top: 4px;
    display: block;
  }

  .auth-submit-btn {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, #4f46e5, #2563eb);
    border: none;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: white;
    cursor: pointer;
    margin-top: 4px;
    transition: all 0.25s;
    box-shadow: 0 4px 14px rgba(79,70,229,0.3);
  }

  .auth-submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79,70,229,0.4);
  }

  .auth-submit-btn:disabled {
    opacity: 0.6; cursor: not-allowed; transform: none;
  }

  .auth-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #dc2626;
    margin-bottom: 14px;
  }

  .auth-info {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    color: #166534;
    margin-bottom: 12px;
  }

  .auth-footer {
    text-align: center;
    margin-top: 20px;
    font-size: 13px;
    color: #64748b;
  }

  .auth-footer a {
    color: #4f46e5;
    text-decoration: none;
    font-weight: 600;
  }

  .auth-footer a:hover { text-decoration: underline; }

  .auth-lang-btn {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1.5px solid #e2e8f0;
    background: white;
    color: #475569;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .auth-lang-btn:hover { border-color: #6366f1; color: #4f46e5; }

  .auth-signin-link {
    padding: 8px 20px;
    border-radius: 8px;
    border: 1.5px solid #e2e8f0;
    background: white;
    color: #1e293b;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
    display: flex; align-items: center;
  }

  .auth-signin-link:hover { border-color: #6366f1; color: #4f46e5; }

  .auth-req-list {
    list-style: none;
    margin: 6px 0 14px;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
  }

  .auth-req-list li {
    font-size: 11px;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s;
  }

  .auth-req-list li.ok { color: #10b981; }
`

function InjectAuthStyles() {
  return <style dangerouslySetInnerHTML={{ __html: AUTH_CSS }} />
}

/* ─── Login Page ─────────────────────────────────────────────────────────── */
export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { lang, toggleLang } = useLangStore()
  const t = translations[lang]
  const login = useAuthStore(s => s.login)
  const loginWithGoogle = useAuthStore(s => s.loginWithGoogle)
  const navigate = useNavigate()
  const isTR = lang === 'TR'
  const googleBtnRef = useRef(null)

  useEffect(() => {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '225324585379-v65rqhj4o29ri9l7e4srn2q1u7jo7u9t.apps.googleusercontent.com'
    const initGoogle = () => {
      if (!window.google || !googleBtnRef.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: googleBtnRef.current.offsetWidth || 324,
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      })
    }
    if (window.google) {
      initGoogle()
    } else {
      const interval = setInterval(() => {
        if (window.google) { initGoogle(); clearInterval(interval) }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [])

  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true)
    setError('')
    try {
      await loginWithGoogle(response.credential)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || (isTR ? 'Google girişi başarısız' : 'Google sign-in failed'))
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError(isTR ? 'E-posta zorunludur.' : 'Email is required.'); return }
    if (password.length < 8) { setError(isTR ? 'Şifre en az 8 karakter olmalıdır.' : 'Password must be at least 8 characters.'); return }
    setLoading(true)
    try { await login(email, password); navigate('/dashboard') }
    catch (err) { setError(err.response?.data?.message || t.loginError) }
    finally { setLoading(false) }
  }

  return (
    <>
      <InjectAuthStyles />
      <div className="auth-page">
        {/* Top Bar */}
        <div className="auth-topbar">
          <div className="auth-logo">
            <div className="auth-logo-icon">CV</div>
            CVCraft
          </div>
          <div className="auth-topbar-right">
            <button className="auth-lang-btn" onClick={toggleLang}>
              {lang === 'TR' ? '🇹🇷 TR' : '🇬🇧 EN'}
            </button>
            <Link to="/register" className="auth-signin-link">
              {isTR ? 'Kayıt Ol' : 'Sign Up'}
            </Link>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card">
          <div className="auth-card-icon">
            <div className="auth-cv-illustration">
              <div className="auth-cv-line dark" />
              <div className="auth-cv-line" />
              <div className="auth-cv-line" />
              <div className="auth-cv-line" style={{ width: '80%' }} />
              <div className="auth-cv-line" style={{ width: '50%' }} />
              <div className="auth-cv-check">✓</div>
            </div>
          </div>

          <h1 className="auth-heading">
            {isTR ? 'Hesabına Giriş Yap' : 'Sign In to Your Account'}
          </h1>
          <p className="auth-subheading">
            {isTR
              ? 'AI destekli CV oluşturmaya devam et.'
              : 'Continue building your AI-powered CV.'}
          </p>

          {error && <div className="auth-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div>
              <label className="auth-label">
                {t.email}
                <span className="auth-char-count">{email.length}/254</span>
              </label>
              <div className="auth-input-wrap">
                <input
                  id="login-email"
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  maxLength={254}
                  required
                  autoComplete="email"
                  placeholder={isTR ? 'ornek@email.com' : 'you@example.com'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="auth-label">
                {t.password}
                <span className="auth-char-count">{password.length}/128</span>
              </label>
              <div className="auth-input-wrap">
                <input
                  id="login-password"
                  className="auth-input has-eye"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
                <EyeButton show={showPwd} onClick={() => setShowPwd(v => !v)} />
              </div>
            </div>

            <button className="auth-submit-btn" type="submit" disabled={loading} id="login-submit">
              {loading ? (isTR ? 'Giriş yapılıyor...' : 'Signing in...') : t.loginBtn}
            </button>
          </form>

          {/* Social logins */}
          <div className="auth-divider" style={{ marginTop: '20px' }}>
            {isTR ? 'veya Google ile giriş yap' : 'or continue with Google'}
          </div>

          {googleLoading ? (
            <div style={{ textAlign: 'center', padding: '12px', color: '#64748b', fontSize: '13px' }}>
              {isTR ? 'Google ile giriş yapılıyor...' : 'Signing in with Google...'}
            </div>
          ) : (
            <div ref={googleBtnRef} style={{ width: '100%', minHeight: '44px' }} />
          )}

          <div className="auth-footer">
            {t.noAccount} <Link to="/register">{t.registerLink}</Link>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Register Page ───────────────────────────────────────────────────────── */
export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { lang, toggleLang } = useLangStore()
  const t = translations[lang]
  const register = useAuthStore(s => s.register)
  const loginWithGoogle = useAuthStore(s => s.loginWithGoogle)
  const navigate = useNavigate()
  const isTR = lang === 'TR'
  const googleBtnRef = useRef(null)

  const strength = getPasswordStrength(password)

  // Password requirement checks
  const reqs = [
    { label: isTR ? '8+ karakter' : '8+ chars', ok: password.length >= 8 },
    { label: isTR ? 'Büyük harf' : 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: isTR ? 'Rakam' : 'Number', ok: /[0-9]/.test(password) },
    { label: isTR ? 'Özel karakter' : 'Special char', ok: /[^A-Za-z0-9]/.test(password) },
  ]

  useEffect(() => {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '225324585379-v65rqhj4o29ri9l7e4srn2q1u7jo7u9t.apps.googleusercontent.com'
    const initGoogle = () => {
      if (!window.google || !googleBtnRef.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: googleBtnRef.current.offsetWidth || 324,
        text: 'signup_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      })
    }
    if (window.google) {
      initGoogle()
    } else {
      const interval = setInterval(() => {
        if (window.google) { initGoogle(); clearInterval(interval) }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [])

  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true)
    setError('')
    try {
      await loginWithGoogle(response.credential)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || (isTR ? 'Google girişi başarısız' : 'Google sign-up failed'))
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError(isTR ? 'Ad Soyad zorunludur.' : 'Full name is required.'); return }
    if (name.trim().length < 2) { setError(isTR ? 'Ad Soyad en az 2 karakter olmalıdır.' : 'Name must be at least 2 characters.'); return }
    if (password.length < 8) { setError(t.passwordShort || (isTR ? 'Şifre en az 8 karakter olmalıdır.' : 'Password must be at least 8 characters.')); return }
    if (password.length > 128) { setError(isTR ? 'Şifre en fazla 128 karakter olabilir.' : 'Password cannot exceed 128 characters.'); return }
    if (password !== confirmPwd) { setError(isTR ? 'Şifreler eşleşmiyor.' : 'Passwords do not match.'); return }
    setLoading(true)
    try { await register(name, email, password); navigate('/dashboard') }
    catch (err) { setError(err.response?.data?.message || t.registerError) }
    finally { setLoading(false) }
  }

  return (
    <>
      <InjectAuthStyles />
      <div className="auth-page">
        <div className="auth-topbar">
          <div className="auth-logo">
            <div className="auth-logo-icon">CV</div>
            CVCraft
          </div>
          <div className="auth-topbar-right">
            <button className="auth-lang-btn" onClick={toggleLang}>
              {lang === 'TR' ? '🇹🇷 TR' : '🇬🇧 EN'}
            </button>
            <Link to="/login" className="auth-signin-link">
              {isTR ? 'Giriş Yap' : 'Sign In'}
            </Link>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-icon">
            <div className="auth-cv-illustration">
              <div className="auth-cv-line dark" />
              <div className="auth-cv-line" />
              <div className="auth-cv-line" />
              <div className="auth-cv-line" style={{ width: '80%' }} />
              <div className="auth-cv-line" style={{ width: '50%' }} />
              <div className="auth-cv-check">✓</div>
            </div>
          </div>

          <h1 className="auth-heading">
            {isTR ? 'Hesap Oluştur' : 'Create Your Account'}
          </h1>
          <p className="auth-subheading">
            {isTR ? 'Ücretsiz başla, istediğin zaman yükselt.' : 'Start for free, upgrade anytime.'}
          </p>

          {error && <div className="auth-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div>
              <label className="auth-label">
                {t.fullName}
                <span className="auth-char-count">{name.length}/100</span>
              </label>
              <div className="auth-input-wrap">
                <input
                  id="reg-name"
                  className="auth-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={100}
                  minLength={2}
                  required
                  autoComplete="name"
                  placeholder={isTR ? 'Adınız Soyadınız' : 'John Doe'}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="auth-label">
                {t.email}
                <span className="auth-char-count">{email.length}/254</span>
              </label>
              <div className="auth-input-wrap">
                <input
                  id="reg-email"
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  maxLength={254}
                  required
                  autoComplete="email"
                  placeholder={isTR ? 'ornek@email.com' : 'you@example.com'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="auth-label">
                {t.passwordHint || (isTR ? 'Şifre' : 'Password')}
                <span className="auth-char-count">{password.length}/128</span>
              </label>
              <div className="auth-input-wrap">
                <input
                  id="reg-password"
                  className={`auth-input has-eye ${password && password.length < 8 ? 'error' : ''}`}
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <EyeButton show={showPwd} onClick={() => setShowPwd(v => !v)} />
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <>
                  <div className="auth-strength-bar">
                    <div className="auth-strength-fill" style={{ width: `${strength.pct}%`, background: strength.color }} />
                  </div>
                  <span className="auth-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                </>
              )}
              {/* Requirements */}
              {password.length > 0 && (
                <ul className="auth-req-list">
                  {reqs.map((r, i) => (
                    <li key={i} className={r.ok ? 'ok' : ''}>
                      {r.ok ? '✓' : '○'} {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="auth-label">
                {isTR ? 'Şifre Tekrar' : 'Confirm Password'}
                {confirmPwd.length > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 600, color: confirmPwd === password ? '#10b981' : '#ef4444' }}>
                    {confirmPwd === password ? (isTR ? '✓ Eşleşiyor' : '✓ Match') : (isTR ? '✕ Eşleşmiyor' : '✕ Mismatch')}
                  </span>
                )}
              </label>
              <div className="auth-input-wrap">
                <input
                  id="reg-confirm"
                  className={`auth-input has-eye ${confirmPwd.length > 0 && confirmPwd !== password ? 'error' : ''}`}
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  maxLength={128}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <EyeButton show={showConfirm} onClick={() => setShowConfirm(v => !v)} />
              </div>
            </div>

            <div className="auth-info">
              🔒 {isTR
                ? 'Şifreniz güvenli şekilde şifrelenerek saklanır. Asla düz metin olarak tutulmaz.'
                : 'Your password is securely encrypted and never stored in plain text.'}
            </div>

            <button className="auth-submit-btn" type="submit" disabled={loading} id="register-submit">
              {loading ? (isTR ? 'Hesap oluşturuluyor...' : 'Creating account...') : t.registerBtn}
            </button>
          </form>

          <div className="auth-divider" style={{ marginTop: '20px' }}>
            {isTR ? 'veya Google ile kayıt ol' : 'or sign up with Google'}
          </div>

          {googleLoading ? (
            <div style={{ textAlign: 'center', padding: '12px', color: '#64748b', fontSize: '13px' }}>
              {isTR ? 'Google ile giriş yapılıyor...' : 'Signing up with Google...'}
            </div>
          ) : (
            <div ref={googleBtnRef} style={{ width: '100%', minHeight: '44px' }} />
          )}

          <div className="auth-footer">
            {t.hasAccount} <Link to="/login">{t.loginLink}</Link>
          </div>
        </div>
      </div>
    </>
  )
}
