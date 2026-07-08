import React, { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';

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
      
      // Match email and password
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLoginSuccess(user);
        onClose();
        // Reset fields
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
      // 1. Check if email already exists
      const checkRes = await fetch(USER_API);
      if (checkRes.ok) {
        const users = await checkRes.json();
        if (users.some(u => u.email === email)) {
          setErrorMsg('An account with this email already exists.');
          return;
        }
      }

      // 2. Register User
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
        // Reset fields
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
      backgroundColor: 'rgba(5, 7, 12, 0.85)',
      backdropFilter: 'blur(6px)',
      zIndex: 1002,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--bg-secondary)',
        padding: '30px',
        position: 'relative'
      }}>
        <button onClick={onClose} className="btn-secondary" style={{ position: 'absolute', top: '20px', right: '20px', padding: '8px', borderRadius: '50%' }}>
          <X size={16} />
        </button>

        {/* Tab Headers */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: isLoginTab ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: isLoginTab ? '#fff' : 'var(--text-muted)',
              paddingBottom: '10px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              flex: 1
            }}
          >
            Log In
          </button>
          <button 
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: !isLoginTab ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: !isLoginTab ? '#fff' : 'var(--text-muted)',
              paddingBottom: '10px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              flex: 1
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error Indicator */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        {isLoginTab ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="john@gmail.com (or admin@booknest.com)" 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter password (e.g. john123)" 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
              <LogIn size={16} /> Authenticate
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Full Name</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Robert Martin" 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="e.g. unclebob@gmail.com" 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Create password" 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}>
              <UserPlus size={16} /> Register Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
