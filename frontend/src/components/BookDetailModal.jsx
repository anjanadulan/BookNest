import React, { useState } from 'react';
import { X, BookOpen, ShoppingCart } from 'lucide-react';

export default function BookDetailModal({ book, isOpen, onClose, onAddToCart, currentUser }) {
  if (!isOpen || !book) return null;

  const [imgError, setImgError] = useState(false);
  const isOutOfStock = book.stock <= 0;
  const showPlaceholder = !book.coverUrl || imgError;

  return (
    <div style={{
      position: 'fixed',
      top: 0, right: 0, bottom: 0, left: 0,
      backgroundColor: 'rgba(94, 28, 35, 0.85)', // 85% opacity of Red Oxide #5E1C23
      backdropFilter: 'blur(8px)',
      zIndex: 1005,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} onClick={onClose}>
      
      {/* Modal Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '700px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '36px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        animation: 'fadeIn 0.25s ease-out'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--transition-smooth)'
        }} onMouseEnter={(e) => e.target.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
          <X size={20} />
        </button>

        {/* Top Header: Title & Author */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '30px' }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            lineHeight: '1.25',
            letterSpacing: '-0.5px'
          }}>
            {book.title}
          </h2>
          <p style={{
            fontSize: '1.05rem',
            fontWeight: 500,
            color: 'var(--color-primary)'
          }}>
            by <span style={{ color: '#fff', fontWeight: 600 }}>{book.author}</span>
          </p>
        </div>

        {/* Two-Column Body Content */}
        <div style={{
          display: 'flex',
          gap: '28px',
          flexWrap: 'wrap',
          alignItems: 'flex-start'
        }}>
          
          {/* Left Column: Cover Image / Fallback Placeholder */}
          <div style={{
            flex: '1 1 220px',
            height: '280px',
            borderRadius: '10px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--glass-border)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {showPlaceholder ? (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(94, 28, 35, 0.4) 100%)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '1px', fontWeight: 600 }}>BookNest Edition</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', lineHeight: '1.2' }}>{book.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{book.author}</span>
                </div>
                <span style={{
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '50%',
                  padding: '8px',
                  background: 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BookOpen size={16} color="var(--color-primary)" />
                </span>
              </div>
            ) : (
              <img 
                src={book.coverUrl} 
                alt={book.title} 
                onError={() => setImgError(true)}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }} 
              />
            )}
          </div>

          {/* Right Column: Metadata details & Description */}
          <div style={{
            flex: '1 1 300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            
            {/* Tag row */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--color-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: '50px',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                {book.category?.name || 'Uncategorized'}
              </span>
              <span style={{
                fontSize: '0.85rem',
                color: isOutOfStock ? '#ef4444' : 'var(--color-primary)',
                fontWeight: 600
              }}>
                {isOutOfStock ? 'Out of Stock' : `${book.stock} Available`}
              </span>
            </div>

            {/* ISBN row */}
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              ISBN: <span style={{ color: 'var(--text-main)' }}>{book.isbn || 'N/A'}</span>
            </p>

            {/* Full Scrollable Description block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Synopsis</span>
              <div style={{
                fontSize: '0.9rem',
                color: 'var(--text-main)',
                opacity: 0.9,
                lineHeight: '1.5',
                maxHeight: '130px',
                overflowY: 'auto',
                paddingRight: '6px'
              }}>
                {book.description || 'No description available for this catalog item.'}
              </div>
            </div>

            {/* Price Tag & Add to Cart button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--glass-border)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Retail Price</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  ${book.price ? book.price.toFixed(2) : '0.00'}
                </span>
              </div>

              {/* Add to Cart button (Hidden for admins) */}
              {currentUser.role !== 'ADMIN' && (
                <button
                  onClick={() => {
                    onAddToCart(book.id);
                    onClose();
                  }}
                  disabled={isOutOfStock}
                  className="btn-primary"
                  style={{
                    padding: '12px 20px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isOutOfStock ? 0.5 : 1,
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    background: isOutOfStock ? 'var(--glass-border)' : undefined,
                    boxShadow: isOutOfStock ? 'none' : undefined
                  }}
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
