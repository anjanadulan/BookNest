import React from 'react';
import { ShoppingCart, Edit, Trash2, AlertCircle } from 'lucide-react';

export default function BookCard({ book, onAddToCart, onEdit, onDelete, isAdmin }) {
  const isOutOfStock = book.stock <= 0;
  const isLowStock = book.stock > 0 && book.stock < 10;

  return (
    <div className="glass-panel animate-fade-in" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '16px',
      borderRadius: '16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Glow highlight on top border */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, var(--accent-purple), transparent)'
      }} />

      {/* Book details */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <span className="badge badge-purple">
            {book.category ? book.category.name : 'Uncategorized'}
          </span>
          {isOutOfStock ? (
            <span className="badge" style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-danger)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
              Out of stock
            </span>
          ) : isLowStock ? (
            <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              Low stock ({book.stock})
            </span>
          ) : (
            <span className="badge badge-neon">
              In Stock ({book.stock})
            </span>
          )}
        </div>

        <h3 style={{
          fontSize: '1.2rem',
          color: 'var(--text-primary)',
          marginBottom: '6px',
          fontFamily: 'var(--font-title)',
          lineHeight: '1.3'
        }}>
          {book.title}
        </h3>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginBottom: '12px'
        }}>
          by <span style={{ color: 'var(--text-primary)' }}>{book.author}</span>
        </p>

        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <span>ISBN: {book.isbn || 'N/A'}</span>
        </div>
      </div>

      {/* Actions / Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: '12px',
        marginTop: 'auto'
      }}>
        {/* Price */}
        <span style={{
          fontSize: '1.35rem',
          fontWeight: '700',
          color: 'var(--accent-neon)',
          fontFamily: 'var(--font-title)'
        }}>
          ${book.price ? book.price.toFixed(2) : '0.00'}
        </span>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {isAdmin ? (
            <>
              <button
                onClick={() => onEdit(book)}
                className="btn-secondary"
                style={{ padding: '8px', borderRadius: '8px' }}
                title="Edit Book"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(book.id)}
                className="btn-secondary"
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  borderColor: 'rgba(244,63,94,0.3)',
                  color: 'var(--accent-danger)'
                }}
                title="Delete Book"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => onAddToCart(book.id)}
              disabled={isOutOfStock}
              className="btn-primary"
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                opacity: isOutOfStock ? 0.5 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer'
              }}
            >
              <ShoppingCart size={16} />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
