import React, { useState, useEffect } from 'react';
import { BookOpen, ShoppingCart, User, ShieldAlert, LogIn, LogOut } from 'lucide-react';

export default function Navbar({ currentUser, onOpenAuth, onLogout, activeTab, onChangeTab, cartItemCount, onOpenCart }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="glass-card" style={{
      width: 'calc(100% - 40px)',
      maxWidth: scrolled ? '850px' : '1200px',
      margin: scrolled ? '10px auto' : '20px auto',
      borderRadius: scrolled ? '50px' : 'var(--border-radius-lg)',
      border: '1px solid var(--glass-border)',
      background: 'var(--glass-bg)',
      padding: scrolled ? '8px 24px' : '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: scrolled ? '10px' : '20px',
      zIndex: 1000,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: scrolled ? '0 10px 25px -5px rgba(0, 0, 0, 0.6)' : 'none'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: scrolled ? '8px' : '10px', cursor: 'pointer' }} onClick={() => onChangeTab('store')}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
          borderRadius: '10px',
          padding: scrolled ? '6px' : '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-neon)',
          transition: 'all 0.3s'
        }}>
          <BookOpen size={scrolled ? 18 : 22} color="#0b0f19" />
        </div>
        <span style={{ 
          fontSize: scrolled ? '1.25rem' : '1.4rem', 
          fontWeight: 800, 
          letterSpacing: '1px', 
          color: '#fff',
          transition: 'all 0.3s'
        }}>
          Book<span style={{ color: 'var(--color-primary)' }}>Nest</span>
        </span>
      </div>

      {/* Main Navigation */}
      <nav style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onChangeTab('store')}
          className="btn-secondary"
          style={{
            borderColor: activeTab === 'store' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'store' ? 'var(--color-primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'store' ? 'var(--shadow-neon)' : 'none',
            padding: scrolled ? '6px 12px' : '10px 18px',
            borderRadius: scrolled ? '20px' : 'var(--border-radius-md)',
            fontSize: scrolled ? '0.8rem' : '0.9rem',
            transition: 'all 0.3s'
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
              gap: '6px',
              padding: scrolled ? '6px 12px' : '10px 18px',
              borderRadius: scrolled ? '20px' : 'var(--border-radius-md)',
              fontSize: scrolled ? '0.8rem' : '0.9rem',
              transition: 'all 0.3s'
            }}
          >
            <ShieldAlert size={14} /> Admin Console
          </button>
        )}

        {currentUser && (
          <button
            onClick={() => onChangeTab('profile')}
            className="btn-secondary"
            style={{
              borderColor: activeTab === 'profile' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--text-muted)',
              padding: scrolled ? '6px 12px' : '10px 18px',
              borderRadius: scrolled ? '20px' : 'var(--border-radius-md)',
              fontSize: scrolled ? '0.8rem' : '0.9rem',
              transition: 'all 0.3s'
            }}
          >
            Profile
          </button>
        )}
      </nav>

      {/* Action / User Session controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: scrolled ? '12px' : '16px' }}>
        {/* Cart Icon (visible for Guest or Customers, hidden for Admins) */}
        {(!currentUser || currentUser.role === 'CUSTOMER') && (
          <button 
            onClick={onOpenCart} 
            className="btn-secondary"
            style={{ 
              position: 'relative', 
              padding: scrolled ? '8px' : '10px',
              borderRadius: '50%',
              transition: 'all 0.3s'
            }}
          >
            <ShoppingCart size={scrolled ? 16 : 20} />
            {cartItemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--text-inverse)',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: scrolled ? '15px' : '18px',
                height: scrolled ? '15px' : '18px',
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
              padding: scrolled ? '6px 12px' : '8px 16px',
              fontSize: scrolled ? '0.75rem' : '0.85rem',
              borderRadius: scrolled ? '20px' : 'var(--border-radius-md)',
              transition: 'all 0.3s'
            }}
          >
            <LogIn size={12} /> Log In / Sign Up
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: scrolled ? '8px' : '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.03)',
              padding: scrolled ? '4px 10px' : '6px 14px',
              borderRadius: scrolled ? '20px' : 'var(--border-radius-md)',
              border: '1px solid var(--glass-border)',
              fontSize: scrolled ? '0.75rem' : '0.85rem',
              fontWeight: 500,
              transition: 'all 0.3s'
            }}>
              <User size={12} color={currentUser.role === 'ADMIN' ? 'var(--color-accent)' : 'var(--color-primary)'} />
              <span>{currentUser.name}</span>
            </div>
            
            <button 
              onClick={onLogout}
              className="btn-secondary"
              style={{
                padding: scrolled ? '6px 10px' : '8px 12px',
                borderRadius: scrolled ? '20px' : 'var(--border-radius-md)',
                color: '#fca5a5',
                borderColor: 'rgba(239, 68, 68, 0.2)',
                fontSize: scrolled ? '0.75rem' : '0.85rem',
                transition: 'all 0.3s'
              }}
            >
              <LogOut size={12} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
