import React from 'react';
import { X, Plus, Minus, Trash2, CreditCard } from 'lucide-react';

export default function CartSidebar({ isOpen, onClose, cartItems, books, onUpdateQuantity, onDeleteItem, onCheckout }) {
  if (!isOpen) return null;

  // Resolve Book details for each CartItem
  const resolvedItems = cartItems.map(item => {
    const book = books.find(b => b.id === item.bookId);
    return {
      ...item,
      title: book ? book.title : 'Loading Book...',
      price: book ? book.price : 0,
      author: book ? book.author : '',
      stock: book ? book.stock : 0
    };
  });

  const cartTotal = resolvedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(5, 7, 12, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 999,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      {/* Click outside to close */}
      <div onClick={onClose} style={{ flexGrow: 1 }} />

      {/* Sidebar Drawer */}
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '440px',
        height: '100%',
        borderRadius: 0,
        borderLeft: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        animation: 'slideIn 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Your Cart</h2>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
          {resolvedItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: '12px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Your shopping cart is empty.</p>
              <button onClick={onClose} className="btn-secondary" style={{ fontSize: '0.85rem' }}>Start Shopping</button>
            </div>
          ) : (
            resolvedItems.map(item => (
              <div key={item.id} className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>${item.price.toFixed(2)} each</p>
                  
                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', borderRadius: '6px' }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', borderRadius: '6px' }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button onClick={() => onDeleteItem(item.id)} className="btn-danger" style={{ padding: '6px 8px', borderRadius: '6px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with totals */}
        {resolvedItems.length > 0 && (
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Total Amount</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                ${cartTotal.toFixed(2)}
              </span>
            </div>
            
            <button onClick={onCheckout} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
              <CreditCard size={18} /> Checkout Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
