import React from 'react';
import { BookOpen, ShoppingCart, User, ShieldAlert } from 'lucide-react';

export default function Navbar({ currentUser, onChangeUser, activeTab, onChangeTab, cartItemCount, onOpenCart }) {
  // Pre-seeded users matching db_setup.sql
  const users = [
    { id: 2, name: 'John Doe', email: 'john@gmail.com', role: 'CUSTOMER' },
    { id: 3, name: 'Jane Smith', email: 'jane@gmail.com', role: 'CUSTOMER' },
    { id: 1, name: 'System Admin', email: 'admin@booknest.com', role: 'ADMIN' }
  ];

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

      {/* Main Navigation */}
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

        {currentUser.role === 'ADMIN' && (
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
      </nav>

      {/* Action / User Session controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Cart Icon (only for customers) */}
        {currentUser.role === 'CUSTOMER' && (
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

        {/* Role Switcher Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--glass-border)' }}>
          <User size={16} color={currentUser.role === 'ADMIN' ? 'var(--color-accent)' : 'var(--color-primary)'} />
          <select 
            value={currentUser.id} 
            onChange={(e) => {
              const selected = users.find(u => u.id === parseInt(e.target.value));
              if (selected) onChangeUser(selected);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {users.map(u => (
              <option key={u.id} value={u.id} style={{ background: 'var(--bg-secondary)', color: '#fff' }}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
