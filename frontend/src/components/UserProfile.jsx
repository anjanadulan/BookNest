import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Shield, CheckCircle, AlertCircle, ShoppingBag, Calendar, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';

export default function UserProfile({ currentUser, onUpdateProfile, books = [] }) {
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

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    const fetchUserOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await fetch(`http://localhost:8083/api/orders?userId=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          // Sort orders by date descending so the most recent is first
          data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (currentUser && currentUser.role === 'CUSTOMER') {
      fetchUserOrders();
    } else {
      setLoadingOrders(false);
    }
  }, [currentUser]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getBookTitle = (bookId) => {
    const foundBook = books.find(b => b.id === bookId);
    return foundBook ? foundBook.title : `Book (ID: #${bookId})`;
  };

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
    <div style={{ maxWidth: '600px', margin: '40px auto 40px auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Account Settings Form Card */}
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

      {/* CUSTOMER Order History Section */}
      {currentUser.role === 'CUSTOMER' && (
        <div className="glass-card" style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '30px 24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={20} color="var(--color-primary)" /> Purchase Order History
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Trace details and tracking status of your placed bookstore orders.
            </p>
          </div>

          {loadingOrders ? (
            <div className="skeleton" style={{ height: '120px', borderRadius: '8px' }} />
          ) : orders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '30px 0',
              border: '1px dashed var(--glass-border)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              fontSize: '0.9rem'
            }}>
              No orders found. Once you place an order, it will appear here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {orders.map(order => {
                const isExpanded = !!expandedOrders[order.id];
                return (
                  <div key={order.id} style={{
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'var(--transition-smooth)'
                  }}>
                    {/* Order summary row click triggers toggle */}
                    <div 
                      onClick={() => toggleOrderExpand(order.id)}
                      style={{
                        padding: '14px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                          Order #{order.id}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {new Date(order.orderDate).toLocaleString()}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* Status Badge */}
                        <span style={{
                          backgroundColor: order.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: order.status === 'COMPLETED' ? '#34d399' : '#fbbf24',
                          border: order.status === 'COMPLETED' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '50px',
                          textTransform: 'uppercase'
                        }}>
                          {order.status}
                        </span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                          ${order.totalAmount.toFixed(2)}
                        </span>
                        {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {/* Detailed item list drawer */}
                    {isExpanded && (
                      <div style={{
                        padding: '16px',
                        borderTop: '1px solid var(--glass-border)',
                        background: 'rgba(5, 7, 12, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Itemized Receipt
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {order.orderItems && order.orderItems.map(item => (
                            <div key={item.id} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.82rem'
                            }}>
                              <div style={{ color: '#e5e7eb' }}>
                                {getBookTitle(item.bookId)}{' '}
                                <strong style={{ color: 'var(--color-primary)', marginLeft: '4px' }}>
                                  × {item.quantity}
                                </strong>
                              </div>
                              <div style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{
                          marginTop: '6px',
                          paddingTop: '10px',
                          borderTop: '1px dashed var(--glass-border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.85rem'
                        }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Total Charged</span>
                          <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                            ${order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
