import React from 'react';
import { BookOpen, ShoppingCart, User, ShieldAlert, LogIn, LogOut } from 'lucide-react';

export default function Navbar({ currentUser, onOpenAuth, onLogout, activeTab, onChangeTab, cartItemCount, onOpenCart }) {
  return (
    <header className="glass-card" style={{
      margin: '20px',
      borderRadius: 'var(--border-radius-lg)',
      border: '1px solid var(--glass-border)',
      background: 'var(--glass-bg)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: '20px',
      zIndex: 100
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => onChangeTab('store')}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
          borderRadius: '10px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-neon)'
        }}>
          <BookOpen size={22} color="#0b0f19" />
        </div>
        <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '1px', color: '#fff' }}>
          Book<span style={{ color: 'var(--color-primary)' }}>Nest</span>
        </span>
      </div>

      {/* Main Navigation (Only visible when storefront or admin is relevant) */}
      <nav style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onChangeTab('store')}
          className="btn-secondary"
          style={{
            borderColor: activeTab === 'store' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'store' ? 'var(--color-primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'store' ? 'var(--shadow-neon)' : 'none'
          }}
        >
          Storefront
        </button>

        {currentUser && currentUser.role === 'ADMIN' && (
          <button
            onClick={() => onChangeTab('admin')}
            className="btn-secondary"
            style={{
              borderColor: activeTab === 'admin' ? 'var(--color-accent)' : 'transparent',
              color: activeTab === 'admin' ? 'var(--color-accent)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldAlert size={16} /> Admin Console
          </button>
        )}

        {currentUser && (
          <button
            onClick={() => onChangeTab('profile')}
            className="btn-secondary"
            style={{
              borderColor: activeTab === 'profile' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--text-muted)'
            }}
          >
            Profile
          </button>
        )}
      </nav>

      {/* Action / User Session controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Cart Icon (visible for Guest or Customers, hidden for Admins) */}
        {(!currentUser || currentUser.role === 'CUSTOMER') && (
          <button 
            onClick={onOpenCart} 
            className="btn-secondary"
            style={{ 
              position: 'relative', 
              padding: '10px',
              borderRadius: '50%'
            }}
          >
            <ShoppingCart size={20} />
            {cartItemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--text-inverse)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-neon)'
              }}>
                {cartItemCount}
              </span>
            )}
          </button>
        )}

        {/* User Session Badging & Login / Logout Action */}
        {!currentUser ? (
          <button 
            onClick={onOpenAuth}
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem'
            }}
          >
            <LogIn size={14} /> Log In / Sign Up
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.03)',
              padding: '6px 14px',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--glass-border)',
              fontSize: '0.85rem',
              fontWeight: 500
            }}>
              <User size={14} color={currentUser.role === 'ADMIN' ? 'var(--color-accent)' : 'var(--color-primary)'} />
              <span>{currentUser.name}</span>
            </div>
            
            <button 
              onClick={onLogout}
              className="btn-secondary"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--border-radius-md)',
                color: '#fca5a5',
                borderColor: 'rgba(239, 68, 68, 0.2)'
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
