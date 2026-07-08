import React, { useState } from 'react';
import { X, BookOpen, LogIn, UserPlus, KeyRound } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [activeView, setActiveView] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const USER_API = 'http://localhost:8085/api/users';

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
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
    setSuccessMsg('');
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${USER_API}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(newPassword)}`, {
        method: 'PUT'
      });
      
      if (res.ok) {
        setSuccessMsg('Password reset successful! Please sign in using your new password.');
        setActiveView('login');
        setPassword('');
        setNewPassword('');
      } else {
        setErrorMsg('Password reset failed. Please ensure the email address is correct and registered.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to authentication server: ' + err.message);
    }
  };

  const getHeaderContent = () => {
    switch (activeView) {
      case 'signup':
        return {
          title: 'Create your account',
          subtitle: 'Start shopping on BookNest by registering.'
        };
      case 'forgot':
        return {
          title: 'Reset password',
          subtitle: 'Enter your email and new password to update your credentials.'
        };
      case 'login':
      default:
        return {
          title: 'Sign in',
          subtitle: 'Welcome back! Please enter your details.'
        };
    }
  };

  const { title, subtitle } = getHeaderContent();

  return (
    <div style={{
      position: 'fixed',
      top: 0, right: 0, bottom: 0, left: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)', // 85% opacity of #0F172A
      backdropFilter: 'blur(8px)',
      zIndex: 1002,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* AuthKit Card Panel */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '40px 32px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--transition-smooth)'
        }} onMouseEnter={(e) => e.target.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
          <X size={16} />
        </button>

        {/* AuthKit Minimal Logo */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{
            background: 'var(--text-main)',
            borderRadius: '6px',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={16} color="var(--bg-primary)" />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>BookNest</span>
        </div>

        {/* Title Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            letterSpacing: '-0.5px'
          }}>
            {title}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        </div>

        {/* Error messaging */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: '0.8rem',
            fontWeight: 500
          }}>
            {errorMsg}
          </div>
        )}

        {/* Success messaging */}
        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#34d399',
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '0.8rem',
            fontWeight: 500
          }}>
            {successMsg}
          </div>
        )}

        {/* Auth Forms */}
        {activeView === 'login' && (
          /* Sign In Form */
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>Email address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>Password</label>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('forgot'); setErrorMsg(''); setSuccessMsg(''); }} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button type="submit" style={{
              background: 'var(--color-primary)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              transition: 'opacity 0.2s'
            }} onMouseEnter={(e) => e.target.style.opacity = '0.9'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
              Continue
            </button>
          </form>
        )}

        {activeView === 'signup' && (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>Full name</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Name" 
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>Email address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button type="submit" style={{
              background: 'var(--color-primary)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              transition: 'opacity 0.2s'
            }} onMouseEnter={(e) => e.target.style.opacity = '0.9'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
              Create account
            </button>
          </form>
        )}

        {activeView === 'forgot' && (
          /* Password Reset Form */
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>Email address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>New password</label>
              <input 
                type="password" 
                required 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="••••••••" 
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button type="submit" style={{
              background: 'var(--color-primary)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              transition: 'opacity 0.2s'
            }} onMouseEnter={(e) => e.target.style.opacity = '0.9'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
              <KeyRound size={16} /> Reset password
            </button>
          </form>
        )}

        {/* Switch tab footer links */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          {activeView === 'login' && (
            <>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('signup'); setErrorMsg(''); setSuccessMsg(''); }} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Sign up
              </a>
            </>
          )}

          {activeView === 'signup' && (
            <>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('login'); setErrorMsg(''); setSuccessMsg(''); }} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Sign in
              </a>
            </>
          )}

          {activeView === 'forgot' && (
            <>
              Remembered your password?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('login'); setErrorMsg(''); setSuccessMsg(''); }} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Sign in
              </a>
            </>
          )}
        </p>

      </div>
    </div>
  );
}
