import React, { useState } from 'react';
import { ShoppingCart, Edit, Trash2, BookOpen } from 'lucide-react';

export default function BookCard({ book, currentUser, onAddToCart, onEdit, onDelete, onSelectBook }) {
  const isOutOfStock = book.stock <= 0;
  const [imgError, setImgError] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const showPlaceholder = !book.coverUrl || imgError;

  return (
    <div className="glass-card" onClick={() => onSelectBook(book)} style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      minHeight: '440px',
      cursor: 'pointer'
    }}>
      {/* Category Tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          color: 'var(--color-secondary)',
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: '50px',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          {book.category?.name || 'Uncategorized'}
        </span>
        <span style={{
          fontSize: '0.8rem',
          color: isOutOfStock ? '#ef4444' : 'var(--color-primary)',
          fontWeight: 500
        }}>
          {isOutOfStock ? 'Out of Stock' : `${book.stock} left`}
        </span>
      </div>

      {/* Book Cover Preview Container */}
      <div style={{
        height: '180px',
        borderRadius: '8px',
        background: 'var(--bg-primary)',
        border: '1px solid var(--glass-border)',
        overflow: 'hidden',
        marginBottom: '14px',
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
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '1px', fontWeight: 600 }}>BookNest Edition</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', lineHeight: '1.2' }}>{book.title}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{book.author}</span>
            </div>
            <span style={{
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '50%',
              padding: '6px',
              background: 'rgba(255,255,255,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={12} color="var(--color-primary)" />
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
              objectFit: 'cover',
              transition: 'transform 0.3s'
            }} 
          />
        )}
      </div>

      {/* Book details */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: '#fff',
          lineHeight: '1.3'
        }}>
          {book.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          by <span style={{ color: '#d1d5db' }}>{book.author}</span>
        </p>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
          ISBN: {book.isbn || 'N/A'}
        </span>

        {/* Dynamic description preview expander */}
        {book.description && (
          <div style={{ marginTop: '8px', fontSize: '0.8rem', lineHeight: '1.4' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {isDescExpanded 
                ? book.description 
                : (book.description.length > 90 ? `${book.description.substring(0, 90)}...` : book.description)
              }
            </span>
            {book.description.length > 90 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsDescExpanded(!isDescExpanded); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  padding: '0 0 0 6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textDecoration: 'underline'
                }}
              >
                {isDescExpanded ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Price & Action row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            ${book.price ? book.price.toFixed(2) : '0.00'}
          </span>
        </div>

        {/* Action Button */}
        {currentUser.role === 'ADMIN' ? (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(book); }} 
              className="btn-secondary"
              style={{ padding: '8px 12px', borderRadius: 'var(--border-radius-md)' }}
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(book.id); }} 
              className="btn-danger"
              style={{ padding: '8px 12px', borderRadius: 'var(--border-radius-md)' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(book.id); }}
            disabled={isOutOfStock}
            className="btn-primary"
            style={{
              padding: '8px 14px',
              opacity: isOutOfStock ? 0.5 : 1,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              background: isOutOfStock ? 'var(--glass-border)' : undefined,
              boxShadow: isOutOfStock ? 'none' : undefined
            }}
          >
            <ShoppingCart size={16} /> Add
          </button>
        )}
      </div>
    </div>
  );
}
