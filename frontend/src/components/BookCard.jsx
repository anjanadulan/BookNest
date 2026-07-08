import React from 'react';
import { ShoppingCart, Edit, Trash2 } from 'lucide-react';

export default function BookCard({ book, currentUser, onAddToCart, onEdit, onDelete }) {
  const isOutOfStock = book.stock <= 0;

  return (
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      minHeight: '280px'
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

      {/* Book details */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#fff',
          lineHeight: '1.3'
        }}>
          {book.title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          by <span style={{ color: '#d1d5db' }}>{book.author}</span>
        </p>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
          ISBN: {book.isbn || 'N/A'}
        </span>
      </div>

      {/* Price & Action row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '20px',
        paddingTop: '14px',
        borderTop: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            ${book.price ? book.price.toFixed(2) : '0.00'}
          </span>
        </div>

        {/* Action Button */}
        {currentUser.role === 'ADMIN' ? (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => onEdit(book)} 
              className="btn-secondary"
              style={{ padding: '8px 12px', borderRadius: 'var(--border-radius-md)' }}
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={() => onDelete(book.id)} 
              className="btn-danger"
              style={{ padding: '8px 12px', borderRadius: 'var(--border-radius-md)' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAddToCart(book.id)}
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
