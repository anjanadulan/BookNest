import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  booksList,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) {
  if (!isOpen) return null;

  // Resolve item details by matching bookId with the book in bookList
  const detailedCartItems = cartItems.map(item => {
    const book = booksList.find(b => b.id === item.bookId);
    return {
      ...item,
      bookTitle: book ? book.title : `Book #${item.bookId}`,
      bookAuthor: book ? book.author : 'Unknown Author',
      bookPrice: book ? book.price : 0,
      bookStock: book ? book.stock : 999
    };
  });

  const totalPrice = detailedCartItems.reduce((sum, item) => sum + (item.bookPrice * item.quantity), 0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div className="glass-panel animate-fade-in" style={{
        width: '400px',
        maxWidth: '100%',
        height: '100%',
        borderRadius: 0,
        borderLeft: '1px solid var(--border-glass)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.5)'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '16px',
          marginBottom: '16px'
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4rem' }}>
            <ShoppingBag size={22} style={{ color: 'var(--accent-neon)' }} />
            Shopping Cart
          </h2>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* List of items */}
        <div style={{
          flexGrow: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingRight: '4px',
          marginBottom: '20px'
        }}>
          {detailedCartItems.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-secondary)',
              gap: '12px'
            }}>
              <ShoppingBag size={48} style={{ opacity: 0.3 }} />
              <p>Your cart is empty</p>
            </div>
          ) : (
            detailedCartItems.map((item) => (
              <div key={item.id} className="glass-panel" style={{
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '12px'
              }}>
                <div style={{ maxWidth: '65%' }}>
                  <h4 style={{
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.bookTitle}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    ${item.bookPrice.toFixed(2)} each
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="btn-secondary"
                      style={{ padding: '4px', borderRadius: '4px', opacity: item.quantity <= 1 ? 0.3 : 1 }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', width: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.bookStock}
                      className="btn-secondary"
                      style={{ padding: '4px', borderRadius: '4px', opacity: item.quantity >= item.bookStock ? 0.3 : 1 }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Remove action */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-danger)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Checkout */}
        {detailedCartItems.length > 0 && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Total:</span>
              <span style={{
                color: 'var(--accent-neon)',
                fontSize: '1.6rem',
                fontWeight: '800',
                fontFamily: 'var(--font-title)'
              }}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              onClick={onCheckout}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                fontSize: '1.05rem',
                padding: '14px'
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
