import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, Eye, EyeOff, AlertCircle, CheckCircle2,
} from 'lucide-react';

export default function Login() {
  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);
  const [shaking,   setShaking]   = useState(false);

  const navigate = useNavigate();

  function triggerShake() {
    setShaking(true);
    setTimeout(() => setShaking(false), 420);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    try {
      // ── TODO ──────────────────────────────────────────────────────────────
      // Swap the stub below for the real API call when auth is ready:
      //
      //   const res = await fetch('http://localhost:5000/api/auth/login', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ username: username.trim(), password }),
      //   });
      //   if (!res.ok) throw new Error((await res.json()).message ?? 'Login failed');
      //   const { token } = await res.json();
      //   localStorage.setItem('token', token);
      // ──────────────────────────────────────────────────────────────────────

      // STUB — simulates a 900 ms network round-trip for UI preview
      await new Promise(r => setTimeout(r, 900));
      if (username.trim() === 'admin' && password === 'admin') {
        setSuccess(true);
        setTimeout(() => navigate('/'), 650);
      } else {
        throw new Error('Invalid username or password.');
      }
      // END STUB

    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* ── Success overlay: fades in, router navigates after 650 ms ── */}
      {success && (
        <div className="login-success-overlay">
          <div className="login-success-icon">
            <CheckCircle2 size={34} strokeWidth={2} />
          </div>
          <p className="login-success-label">Signing you in…</p>
        </div>
      )}

      <div className="login-page">
        {/*
          Two-element split:
          .login-entrance  → plays the card-entrance animation once, never again
          .login-card      → plays shake animation on error (no conflict)
        */}
        <div className="login-entrance">
          <div className={`login-card${shaking ? ' shake' : ''}`}>

            {/* ── Brand ── */}
            <div className="login-brand">
              <div className="login-logo">🩸</div>
              <h1 className="login-title">Blood Bank</h1>
              <p className="login-subtitle">Sign in to manage your blood bank</p>
            </div>

            {/* ── Form ── */}
            <form className="login-form" onSubmit={handleSubmit} noValidate>

              {/* Username */}
              <div className="login-field">
                <label className="login-label" htmlFor="lf-username">
                  Username
                </label>
                <div className="login-input-wrap">
                  <User className="login-field-icon" size={16} strokeWidth={2} />
                  <input
                    id="lf-username"
                    className="login-input"
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    disabled={isLoading || success}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field">
                <label className="login-label" htmlFor="lf-password">
                  Password
                </label>
                <div className="login-input-wrap">
                  <Lock className="login-field-icon" size={16} strokeWidth={2} />
                  <input
                    id="lf-password"
                    className="login-input login-input--pw"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLoading || success}
                  />
                  <button
                    type="button"
                    className="login-eye"
                    onClick={() => setShowPwd(v => !v)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd
                      ? <EyeOff size={17} strokeWidth={1.8} />
                      : <Eye    size={17} strokeWidth={1.8} />}
                  </button>
                </div>
              </div>

              {/* Inline error */}
              {error && (
                <div className="login-error" role="alert">
                  <AlertCircle size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="login-submit"
                disabled={isLoading || success}
              >
                {isLoading
                  ? (<><span className="login-spin" />Signing in…</>)
                  : 'Sign In'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}
