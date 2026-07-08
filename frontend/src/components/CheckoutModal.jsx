import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, cartItems, books, onPlaceOrder, currentUser }) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1); // 1: Shipping/Address, 2: Payment Details, 3: Success
  const [address, setAddress] = useState('123 Booknest St, Colombo');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [orderSummary, setOrderSummary] = useState(null);

  // Resolve cart items
  const resolvedItems = cartItems.map(item => {
    const book = books.find(b => b.id === item.bookId);
    return {
      ...item,
      title: book ? book.title : 'Book',
      price: book ? book.price : 0
    };
  });

  const totalAmount = resolvedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmitDetails = () => {
    setStep(2);
  };

  const handleProcessOrder = async () => {
    // Compile order request payload
    const orderPayload = {
      userId: currentUser.id,
      totalAmount: totalAmount,
      status: 'COMPLETED',
      orderDate: new Date().toISOString(),
      orderItems: resolvedItems.map(item => ({
        bookId: item.bookId,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      const summary = await onPlaceOrder(orderPayload, paymentMethod);
      if (summary) {
        setOrderSummary(summary);
        setStep(3);
      }
    } catch (e) {
      alert('Order placement failed: ' + e.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(5, 7, 12, 0.85)',
      backdropFilter: 'blur(6px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Modal Container */}
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '560px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '30px',
        position: 'relative',
        boxShadow: 'var(--shadow-indigo)'
      }}>
        {/* Close Button (only on steps 1 and 2) */}
        {step < 3 && (
          <button onClick={onClose} className="btn-secondary" style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px',
            borderRadius: '50%'
          }}>
            <X size={18} />
          </button>
        )}

        {/* STEP 1: Shipping Address */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Delivery Details</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Provide your shipping location to proceed with the invoice checkout.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Recipient Name</label>
                <input type="text" value={currentUser.name} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Recipient Email</label>
                <input type="text" value={currentUser.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Shipping Address</label>
                <textarea 
                  rows={3} 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Enter your shipping address"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Amount Due: <strong style={{ color: 'var(--color-primary)' }}>${totalAmount.toFixed(2)}</strong></span>
              <button onClick={handleSubmitDetails} className="btn-primary">
                Proceed to Payment
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Mock Payment */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Secure Payment Gateway</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Select mock method and process simulated transactions.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
              {/* Payment Method Selector */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className="btn-secondary" 
                  style={{
                    flex: 1,
                    borderColor: paymentMethod === 'CREDIT_CARD' ? 'var(--color-primary)' : undefined,
                    background: paymentMethod === 'CREDIT_CARD' ? 'rgba(0, 245, 212, 0.04)' : undefined
                  }}
                >
                  Credit Card
                </button>
                <button 
                  onClick={() => setPaymentMethod('PAYPAL')}
                  className="btn-secondary" 
                  style={{
                    flex: 1,
                    borderColor: paymentMethod === 'PAYPAL' ? 'var(--color-primary)' : undefined,
                    background: paymentMethod === 'PAYPAL' ? 'rgba(0, 245, 212, 0.04)' : undefined
                  }}
                >
                  PayPal
                </button>
              </div>

              {paymentMethod === 'CREDIT_CARD' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Card Number</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(e.target.value)} 
                        style={{ width: '100%', paddingLeft: '38px' }}
                      />
                      <CreditCard size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Expiry</label>
                      <input type="text" placeholder="MM/YY" defaultValue="12/28" />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>CVV</label>
                      <input type="password" placeholder="***" defaultValue="123" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Simulating redirection to PayPal gateway on order placement.</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
              <button onClick={() => setStep(1)} className="btn-secondary">
                Back
              </button>
              <button onClick={handleProcessOrder} className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}>
                <ShieldCheck size={18} /> Pay & Place Order
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && orderSummary && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: '20px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle size={48} />
            </div>
            
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Order Placed!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>Transaction verified and processed successfully across services.</p>

            <div className="glass-card" style={{
              background: 'rgba(255,255,255,0.02)',
              padding: '20px',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '30px',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>#{orderSummary.orderId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transaction ID:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', wordBreak: 'break-all' }}>{orderSummary.transactionId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>${orderSummary.amount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>{orderSummary.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>{orderSummary.status}</span>
              </div>
            </div>

            <button onClick={() => {
              onClose();
              setStep(1);
            }} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Return to Storefront
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
