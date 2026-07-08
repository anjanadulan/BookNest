import React, { useState } from 'react';
import { X, BookOpen, LogIn, UserPlus } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const USER_API = 'http://localhost:8085/api/users';

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch(USER_API);
      if (!res.ok) throw new Error("Could not fetch user registry");
      const users = await res.json();
      
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLoginSuccess(user);
        onClose();
        setEmail('');
        setPassword('');
      } else {
        setErrorMsg('Invalid email or password.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to authentication server: ' + err.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const checkRes = await fetch(USER_API);
      if (checkRes.ok) {
        const users = await checkRes.json();
        if (users.some(u => u.email === email)) {
          setErrorMsg('An account with this email already exists.');
          return;
        }
      }

      const payload = {
        name,
        email,
        password,
        role: 'CUSTOMER'
      };

      const res = await fetch(USER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdUser = await res.json();
        onLoginSuccess(createdUser);
        onClose();
        setName('');
        setEmail('');
        setPassword('');
      } else {
        setErrorMsg('Sign up failed on server.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to registration server: ' + err.message);
    }
  };

  // Custom SVGs for Google and Facebook
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
      <path fill="#4285F4" d="M23.745 12.27c0-.77-.07-1.54-.2-2.27H12v4.51h6.6c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.84 7.31 24 12 24z"/>
      <path fill="#FBBC05" d="M5.27 14.29A7.18 7.18 0 0 1 4.8 12c0-.79.13-1.57.38-2.29V6.62H1.29A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.29 5.38l3.98-3.09z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.3 0 3.27 2.16 1.29 5.38l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
    </svg>
  );

  const FacebookIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" style={{ marginRight: '8px' }}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0, right: 0, bottom: 0, left: 0,
      backgroundColor: 'rgba(5, 7, 12, 0.85)',
      backdropFilter: 'blur(6px)',
      zIndex: 1002,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Centered Sign-In/Up Card */}
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '450px',
        background: 'var(--bg-secondary)',
        padding: '36px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: 'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px'
      }}>
        {/* Close Button */}
        <button onClick={onClose} className="btn-secondary" style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '8px',
          borderRadius: '50%'
        }}>
          <X size={16} />
        </button>

        {/* Brand Sitemark Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            borderRadius: '10px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-neon)'
          }}>
            <BookOpen size={24} color="#0b0f19" />
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.6rem',
          fontWeight: 700,
          color: '#fff',
          textAlign: 'center',
          letterSpacing: '-0.5px'
        }}>
          {isLoginTab ? 'Sign in' : 'Create an Account'}
        </h2>

        {/* Error message box */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            fontSize: '0.85rem'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Form elements */}
        {isLoginTab ? (
          /* Sign In Form */
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>Email</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="your@email.com" 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>Password</label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Mock password recovery: user credentials are listed in the README."); }} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '4px' }}>
              <input type="checkbox" defaultChecked style={{ width: 'auto', height: 'auto', accentColor: 'var(--color-primary)' }} />
              Remember me
            </label>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }}>
              <LogIn size={16} /> Sign in
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>Full Name</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Jon Snow" 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>Email</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="your@email.com" 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}>
              <UserPlus size={16} /> Sign up
            </button>
          </form>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', textalign: 'center', margin: '8px 0' }}>
          <div style={{ flexGrow: 1, height: '1px', background: 'var(--glass-border)' }}></div>
          <span style={{ padding: '0 12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'lowercase' }}>or</span>
          <div style={{ flexGrow: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        </div>

        {/* Social Authentication buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            type="button" 
            onClick={() => alert("Simulating Google OAuth authentication.")}
            className="btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.9rem' }}
          >
            <GoogleIcon /> Sign in with Google
          </button>
          <button 
            type="button" 
            onClick={() => alert("Simulating Facebook OAuth authentication.")}
            className="btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.9rem' }}
          >
            <FacebookIcon /> Sign in with Facebook
          </button>
        </div>

        {/* Switch mode footer link */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          marginTop: '10px'
        }}>
          {isLoginTab ? (
            <>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginTab(false); setErrorMsg(''); }} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginTab(true); setErrorMsg(''); }} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Sign in
              </a>
            </>
          )}
        </p>

      </div>
    </div>
  );
}
