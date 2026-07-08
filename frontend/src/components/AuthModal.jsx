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



  return (
    <div style={{
      position: 'fixed',
      top: 0, right: 0, bottom: 0, left: 0,
      backgroundColor: 'rgba(9, 9, 11, 0.85)',
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
        backgroundColor: '#09090b',
        border: '1px solid #27272a',
        borderRadius: '12px',
        padding: '40px 32px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'transparent',
          border: 'none',
          color: '#a1a1aa',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#a1a1aa'}>
          <X size={16} />
        </button>

        {/* AuthKit Minimal Logo */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '6px',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={16} color="#09090b" />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.3px' }}>BookNest</span>
        </div>

        {/* Title Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#fff',
            letterSpacing: '-0.5px'
          }}>
            {isLoginTab ? 'Sign in' : 'Create your account'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
            {isLoginTab ? 'Welcome back! Please enter your details.' : 'Start shopping on BookNest by registering.'}
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

        {/* Auth Forms */}
        {isLoginTab ? (
          /* Sign In Form */
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#e4e4e7' }}>Email address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                style={{
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '10px 12px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifycontent: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#e4e4e7' }}>Password</label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Credentials can be found in the README file."); }} style={{ fontSize: '0.8rem', color: '#fff', textDecoration: 'underline', fontWeight: 400 }}>
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
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '10px 12px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button type="submit" style={{
              background: '#ffffff',
              color: '#09090b',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
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
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#e4e4e7' }}>Full name</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Name" 
                style={{
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '10px 12px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#e4e4e7' }}>Email address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                style={{
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '10px 12px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#e4e4e7' }}>Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                style={{
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '10px 12px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button type="submit" style={{
              background: '#ffffff',
              color: '#09090b',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
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



        {/* Switch tab footer links */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#71717a'
        }}>
          {isLoginTab ? (
            <>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginTab(false); setErrorMsg(''); }} style={{ color: '#fff', textDecoration: 'underline', fontWeight: 500 }}>
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginTab(true); setErrorMsg(''); }} style={{ color: '#fff', textDecoration: 'underline', fontWeight: 500 }}>
                Sign in
              </a>
            </>
          )}
        </p>

      </div>
    </div>
  );
}
