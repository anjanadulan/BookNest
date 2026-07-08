import React from 'react';
import { ShoppingCart, ShieldCheck, UserCheck, Library, LayoutDashboard } from 'lucide-react';

export default function Navbar({
  currentUser,
  usersList,
  onUserSwitch,
  cartCount,
  activeTab,
  setActiveTab,
  onCartToggle
}) {
  return (
    <nav className="glass-panel" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      margin: '20px auto',
      maxWidth: '1200px',
      borderRadius: '16px',
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Library size={28} className="text-primary" style={{ color: 'var(--accent-neon)' }} />
        <span style={{
          fontFamily: 'var(--font-title)',
          fontSize: '1.5rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #ffffff, var(--text-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Book<span style={{ color: 'var(--accent-neon)' }}>Nest</span>
        </span>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setActiveTab('store')}
          className={activeTab === 'store' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          <Library size={18} />
          Bookstore
        </button>

        {currentUser && currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={activeTab === 'admin' ? 'btn-neon' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            <LayoutDashboard size={18} />
            Admin Panel
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* User Switcher Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentUser && currentUser.role === 'ADMIN' ? (
            <ShieldCheck size={20} style={{ color: 'var(--accent-neon)' }} />
          ) : (
            <UserCheck size={20} style={{ color: 'var(--accent-purple)' }} />
          )}
          <select
            value={currentUser ? currentUser.id : ''}
            onChange={(e) => {
              const selected = usersList.find(u => u.id === parseInt(e.target.value));
              if (selected) onUserSwitch(selected);
            }}
            className="glass-input"
            style={{
              padding: '6px 12px',
              fontSize: '0.85rem',
              backgroundColor: 'rgba(9, 13, 22, 0.8)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {usersList.map((user) => (
              <option key={user.id} value={user.id} style={{ backgroundColor: '#090d16', color: '#fff' }}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>

        {/* Shopping Cart Trigger */}
        <button
          onClick={onCartToggle}
          className="btn-secondary"
          style={{
            position: 'relative',
            padding: '10px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: 'var(--accent-danger)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: '700',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(244, 63, 94, 0.5)'
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
