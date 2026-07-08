import React, { useState } from 'react';
import { User, Mail, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function UserProfile({ currentUser, onUpdateProfile }) {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  
  // Password change states
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Password Match Validation
    if (changePassword) {
      if (!newPassword) {
        setErrorMsg('Please enter a new password.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New passwords do not match. Please verify.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const updatedUserPayload = {
        id: currentUser.id,
        name,
        email,
        password: changePassword ? newPassword : currentUser.password,
        role: currentUser.role
      };

      const result = await onUpdateProfile(updatedUserPayload);
      if (result) {
        setSuccessMsg('Profile information updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
        setChangePassword(false);
      } else {
        setErrorMsg('Failed to save profile changes. Please try again.');
      }
    } catch (err) {
      setErrorMsg('An error occurred while saving: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto 0 auto' }}>
      <div className="glass-card" style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Title Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Account Settings
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Update your profile identity and manage your credentials.
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            padding: '12px 14px',
            borderRadius: '6px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: '0.85rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success notification */}
        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#34d399',
            padding: '12px 14px',
            borderRadius: '6px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '0.85rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form content */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Name Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} color="var(--text-muted)" /> Full name
            </label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Alan Turing" 
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

          {/* Email Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} color="var(--text-muted)" /> Email address
            </label>
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

          {/* Account Role Badge (Read-only for safety) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} color="var(--text-muted)" /> Security Role
            </span>
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--glass-border)',
              borderRadius: '6px',
              color: currentUser.role === 'ADMIN' ? 'var(--color-secondary)' : 'var(--color-primary)',
              padding: '10px 12px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}>
              {currentUser.role}
            </div>
          </div>

          {/* Toggle Password Reset Option */}
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={changePassword} 
                onChange={(e) => {
                  setChangePassword(e.target.checked);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{ width: 'auto', height: 'auto', accentColor: 'var(--color-primary)' }} 
              />
              Change account password
            </label>
          </div>

          {/* Password Input Fields */}
          {changePassword && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.2s ease-out' }}>
              {/* New Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} color="var(--text-muted)" /> New password
                </label>
                <input 
                  type="password" 
                  required={changePassword}
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

              {/* Confirm New Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} color="var(--text-muted)" /> Confirm new password
                </label>
                <input 
                  type="password" 
                  required={changePassword}
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
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
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={submitting}
            style={{
              background: 'var(--color-primary)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              padding: '12px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '10px',
              transition: 'opacity 0.2s',
              opacity: submitting ? 0.7 : 1
            }} 
            onMouseEnter={(e) => { if (!submitting) e.target.style.opacity = '0.9' }} 
            onMouseLeave={(e) => { if (!submitting) e.target.style.opacity = '1' }}
          >
            {submitting ? 'Saving changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
