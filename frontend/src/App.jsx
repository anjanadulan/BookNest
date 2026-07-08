import React, { useState, useEffect } from 'react';
import { ShoppingBag, CreditCard, CheckCircle, Plus, Edit2, AlertCircle, ShoppingCart } from 'lucide-react';
import Navbar from './components/Navbar';
import BookCard from './components/BookCard';
import CartSidebar from './components/CartSidebar';

// Microservices API Base URLs
const API = {
  user: 'http://localhost:8085/api',
  book: 'http://localhost:8081/api',
  cart: 'http://localhost:8082/api',
  order: 'http://localhost:8083/api',
  payment: 'http://localhost:8084/api'
};

export default function App() {
  // Global States
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);

  // UI States
  const [activeTab, setActiveTab] = useState('store');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Checkout Form States
  const [checkoutStep, setCheckoutStep] = useState('none'); // 'none', 'details', 'paying', 'confirmed'
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState('CREDIT_CARD');
  const [transactionId, setTransactionId] = useState('');
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Admin Book Form States
  const [editingBook, setEditingBook] = useState(null); // null means adding a new book
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    price: '',
    stock: '',
    categoryId: ''
  });

  // Fetch initial configuration data
  useEffect(() => {
    fetchUsers();
    fetchBooks();
    fetchCategories();
  }, []);

  // Fetch cart whenever active user changes
  useEffect(() => {
    if (currentUser) {
      fetchCart(currentUser.id);
      if (currentUser.role === 'ADMIN') {
        fetchAdminData();
      }
    } else {
      setCartItems([]);
    }
  }, [currentUser]);

  // Network Fetch Functions
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API.user}/users`);
      const data = await res.json();
      setUsersList(data);
      if (data.length > 0) {
        // Default to the customer John Doe if available, or first user
        const defaultUser = data.find(u => u.email === 'john@gmail.com') || data[0];
        setCurrentUser(defaultUser);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await fetch(`${API.book}/books`);
      const data = await res.json();
      setBooksList(data);
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API.book}/books`); // fetch category data if endpoint matches, but wait
      // The book service has /books which includes category relationship
      // Categories seeding script loaded categories: Fiction, Science, History, Biography.
      // Let's hardcode the categories list matching db_setup.sql for robust category filtering,
      // or extract categories dynamically from loaded books
      const catsRes = await fetch(`${API.book}/books`);
      const booksData = await catsRes.json();
      const extractedCategories = [];
      booksData.forEach(b => {
        if (b.category && !extractedCategories.some(c => c.id === b.category.id)) {
          extractedCategories.push(b.category);
        }
      });
      // Fallback if empty
      if (extractedCategories.length === 0) {
        setCategoriesList([
          { id: 1, name: 'Fiction' },
          { id: 2, name: 'Science' },
          { id: 3, name: 'History' },
          { id: 4, name: 'Biography' }
        ]);
      } else {
        setCategoriesList(extractedCategories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchCart = async (userId) => {
    try {
      const res = await fetch(`${API.cart}/cart?userId=${userId}`);
      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const fetchAdminData = async () => {
    try {
      const ordersRes = await fetch(`${API.order}/orders`);
      const ordersData = await ordersRes.json();
      setOrdersList(ordersData);

      const paymentsRes = await fetch(`${API.payment}/payments`);
      const paymentsData = await paymentsRes.json();
      setPaymentsList(paymentsData);
    } catch (err) {
      console.error('Error fetching admin dashboards:', err);
    }
  };

  // Cart operations
  const handleAddToCart = async (bookId) => {
    if (!currentUser) return;
    try {
      // Find if item already exists in active user's cart
      const existing = cartItems.find(item => item.bookId === bookId);
      if (existing) {
        // Increment quantity by 1
        handleUpdateCartItemQuantity(existing.id, existing.quantity + 1);
      } else {
        // Add new CartItem
        const res = await fetch(`${API.cart}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            bookId: bookId,
            quantity: 1
          })
        });
        if (res.ok) {
          fetchCart(currentUser.id);
        }
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const handleUpdateCartItemQuantity = async (cartItemId, quantity) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (!item) return;
    try {
      const res = await fetch(`${API.cart}/cart`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cartItemId,
          userId: item.userId,
          bookId: item.bookId,
          quantity: quantity
        })
      });
      if (res.ok) {
        fetchCart(currentUser.id);
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const handleRemoveCartItem = async (cartItemId) => {
    try {
      const res = await fetch(`${API.cart}/cart/${cartItemId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCart(currentUser.id);
      }
    } catch (err) {
      console.error('Error deleting cart item:', err);
    }
  };

  // Checkout pipeline (verifying cross-service validation)
  const handleCheckoutProcess = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0 || !currentUser) return;
    setLoadingCheckout(true);

    try {
      // 1. Calculate Total Amount
      let total = 0;
      const orderItems = [];

      for (const item of cartItems) {
        const book = booksList.find(b => b.id === item.bookId);
        if (book) {
          total += book.price * item.quantity;
          orderItems.push({
            bookId: item.bookId,
            quantity: item.quantity,
            price: book.price
          });
        }
      }

      // 2. Create Order in order-service
      const orderRes = await fetch(`${API.order}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          totalAmount: total,
          status: 'PENDING',
          orderDate: new Date().toISOString(),
          orderItems: orderItems
        })
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) throw new Error('Order creation failed');

      // 3. Process mock Payment in payment-service
      const mockTransactionId = `TXN-${Math.floor(Math.random() * 90000000) + 10000000}`;
      const paymentRes = await fetch(`${API.payment}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.id,
          userId: currentUser.id,
          amount: total,
          paymentMethod: checkoutPaymentMethod,
          status: 'SUCCESS',
          transactionId: mockTransactionId,
          paymentDate: new Date().toISOString()
        })
      });

      if (!paymentRes.ok) throw new Error('Payment processing failed');

      // 4. Update order status to COMPLETED
      await fetch(`${API.order}/orders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderData.id,
          userId: currentUser.id,
          totalAmount: total,
          status: 'COMPLETED',
          orderDate: orderData.orderDate
        })
      });

      // 5. Update book stock levels in book-service
      for (const item of cartItems) {
        const book = booksList.find(b => b.id === item.bookId);
        if (book) {
          const updatedStock = Math.max(0, book.stock - item.quantity);
          await fetch(`${API.book}/books`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: book.id,
              title: book.title,
              author: book.author,
              isbn: book.isbn,
              price: book.price,
              stock: updatedStock,
              category: book.category
            })
          });
        }
      }

      // 6. Delete items in cart-service
      for (const item of cartItems) {
        await fetch(`${API.cart}/cart/${item.id}`, { method: 'DELETE' });
      }

      // Complete Checkout Flow
      setTransactionId(mockTransactionId);
      setCheckoutStep('confirmed');
      fetchCart(currentUser.id);
      fetchBooks(); // refresh stock numbers on storefront
      if (currentUser.role === 'ADMIN') fetchAdminData();

    } catch (err) {
      console.error('Checkout error:', err);
      alert('Checkout process failed. Please check your service connections.');
    } finally {
      setLoadingCheckout(false);
    }
  };

  // Admin Book Management
  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      const selectedCategoryObj = categoriesList.find(c => c.id === parseInt(bookForm.categoryId));
      const payload = {
        title: bookForm.title,
        author: bookForm.author,
        isbn: bookForm.isbn,
        price: parseFloat(bookForm.price),
        stock: parseInt(bookForm.stock),
        category: selectedCategoryObj || null
      };

      if (editingBook) {
        payload.id = editingBook.id;
      }

      const res = await fetch(`${API.book}/books`, {
        method: editingBook ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setBookForm({ title: '', author: '', isbn: '', price: '', stock: '', categoryId: '' });
        setEditingBook(null);
        fetchBooks();
      }
    } catch (err) {
      console.error('Error saving book:', err);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      const res = await fetch(`${API.book}/books/${bookId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchBooks();
      }
    } catch (err) {
      console.error('Error deleting book:', err);
    }
  };

  const handleEditBookInit = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      price: book.price.toString(),
      stock: book.stock.toString(),
      categoryId: book.category ? book.category.id.toString() : ''
    });
  };

  // Filtering book listings
  const filteredBooks = booksList.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                            (book.category && book.category.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        usersList={usersList}
        onUserSwitch={setCurrentUser}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
      />

      {/* Cart Drawer */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        booksList={booksList}
        onUpdateQuantity={handleUpdateCartItemQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setCheckoutStep('details');
        }}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Bookstore View */}
        {activeTab === 'store' && checkoutStep === 'none' && (
          <div>
            {/* Filter controls */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '32px'
            }}>
              {/* Category switches */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={selectedCategory === 'All' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  All Categories
                </button>
                {categoriesList.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={selectedCategory === cat.name ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input"
                style={{ width: '300px', maxWidth: '100%', borderRadius: '10px' }}
              />
            </div>

            {/* Book Catalog Grid */}
            {filteredBooks.length === 0 ? (
              <div className="glass-panel" style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--text-secondary)'
              }}>
                <AlertCircle size={40} style={{ color: 'var(--accent-purple)', marginBottom: '16px' }} />
                <p>No books found matching the selected filters.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '24px'
              }}>
                {filteredBooks.map(book => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onAddToCart={handleAddToCart}
                    onEdit={handleEditBookInit}
                    onDelete={handleDeleteBook}
                    isAdmin={currentUser && currentUser.role === 'ADMIN'}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Checkout Steps */}
        {checkoutStep === 'details' && (
          <div className="glass-panel animate-fade-in" style={{
            maxWidth: '600px',
            margin: '40px auto',
            padding: '32px',
            borderRadius: '16px'
          }}>
            <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard style={{ color: 'var(--accent-neon)' }} />
              Billing & Payment
            </h2>
            <form onSubmit={handleCheckoutProcess} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Shipping Address</label>
                <textarea
                  required
                  placeholder="Enter your shipping address..."
                  value={checkoutAddress}
                  onChange={(e) => setCheckoutAddress(e.target.value)}
                  className="glass-input"
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Payment Method</label>
                <select
                  value={checkoutPaymentMethod}
                  onChange={(e) => setCheckoutPaymentMethod(e.target.value)}
                  className="glass-input"
                  style={{ backgroundColor: 'rgba(9, 13, 22, 0.8)', cursor: 'pointer' }}
                >
                  <option value="CREDIT_CARD" style={{ backgroundColor: '#090d16', color: '#fff' }}>Credit Card</option>
                  <option value="PAYPAL" style={{ backgroundColor: '#090d16', color: '#fff' }}>PayPal</option>
                  <option value="BANK_TRANSFER" style={{ backgroundColor: '#090d16', color: '#fff' }}>Bank Transfer</option>
                </select>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                paddingTop: '20px',
                marginTop: '10px'
              }}>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('none')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingCheckout}
                  className="btn-primary"
                >
                  {loadingCheckout ? 'Processing Order...' : 'Pay & Complete'}
                </button>
              </div>
            </form>
          </div>
        )}

        {checkoutStep === 'confirmed' && (
          <div className="glass-panel animate-fade-in" style={{
            maxWidth: '500px',
            margin: '60px auto',
            padding: '40px',
            textAlign: 'center',
            borderRadius: '16px'
          }}>
            <CheckCircle size={64} style={{ color: 'var(--accent-success)', marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '12px' }}>Order Placed Successfully!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
              Your order has been recorded across the microservices catalog.
            </p>

            <div className="glass-panel" style={{
              padding: '16px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              fontSize: '0.85rem',
              marginBottom: '32px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div><strong>Gateway Status:</strong> SUCCESS</div>
              <div><strong>Transaction ID:</strong> <span style={{ color: 'var(--accent-neon)', fontFamily: 'monospace' }}>{transactionId}</span></div>
            </div>

            <button
              onClick={() => {
                setCheckoutStep('none');
                setCheckoutAddress('');
              }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Back to Bookstore
            </button>
          </div>
        )}

        {/* Admin Dashboard Tab */}
        {activeTab === 'admin' && currentUser && currentUser.role === 'ADMIN' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '20px' }}>
            {/* Book Manager Panel */}
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px' }}>
              <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus style={{ color: 'var(--accent-neon)' }} />
                {editingBook ? 'Edit Book Record' : 'Add New Book to Inventory'}
              </h2>
              <form onSubmit={handleSaveBook} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px'
              }}>
                <input
                  required
                  type="text"
                  placeholder="Book Title"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="glass-input"
                />
                <input
                  required
                  type="text"
                  placeholder="Author"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  className="glass-input"
                />
                <input
                  type="text"
                  placeholder="ISBN"
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  className="glass-input"
                />
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="Price ($)"
                  value={bookForm.price}
                  onChange={(e) => setBookForm({ ...bookForm, price: e.target.value })}
                  className="glass-input"
                />
                <input
                  required
                  type="number"
                  placeholder="Stock Level"
                  value={bookForm.stock}
                  onChange={(e) => setBookForm({ ...bookForm, stock: e.target.value })}
                  className="glass-input"
                />
                <select
                  required
                  value={bookForm.categoryId}
                  onChange={(e) => setBookForm({ ...bookForm, categoryId: e.target.value })}
                  className="glass-input"
                  style={{ backgroundColor: 'rgba(9, 13, 22, 0.8)', cursor: 'pointer' }}
                >
                  <option value="" disabled style={{ backgroundColor: '#090d16', color: '#6b7280' }}>Select Category</option>
                  {categoriesList.map(cat => (
                    <option key={cat.id} value={cat.id} style={{ backgroundColor: '#090d16', color: '#fff' }}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <div style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '10px'
                }}>
                  {editingBook && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBook(null);
                        setBookForm({ title: '', author: '', isbn: '', price: '', stock: '', categoryId: '' });
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn-primary">
                    {editingBook ? 'Save Modifications' : 'Publish Book'}
                  </button>
                </div>
              </form>
            </div>

            {/* Dashboard Audit Log Table (Orders & Payments) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px'
            }}>
              {/* Order Ledger */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', overflow: 'hidden' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={20} style={{ color: 'var(--accent-purple)' }} />
                  Order Ledger (order-service)
                </h3>
                <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>Order ID</th>
                        <th style={{ padding: '8px' }}>User ID</th>
                        <th style={{ padding: '8px' }}>Date</th>
                        <th style={{ padding: '8px' }}>Amount</th>
                        <th style={{ padding: '8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersList.map(ord => (
                        <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '8px', fontWeight: '600' }}>#{ord.id}</td>
                          <td style={{ padding: '8px' }}>User {ord.userId}</td>
                          <td style={{ padding: '8px' }}>{new Date(ord.orderDate).toLocaleDateString()}</td>
                          <td style={{ padding: '8px', color: 'var(--accent-neon)' }}>${ord.totalAmount.toFixed(2)}</td>
                          <td style={{ padding: '8px' }}>
                            <span className="badge" style={{
                              backgroundColor: ord.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: ord.status === 'COMPLETED' ? 'var(--accent-success)' : '#f59e0b'
                            }}>{ord.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Ledger */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', overflow: 'hidden' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={20} style={{ color: 'var(--accent-neon)' }} />
                  Payment Ledger (payment-service)
                </h3>
                <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>Order ID</th>
                        <th style={{ padding: '8px' }}>Txn ID</th>
                        <th style={{ padding: '8px' }}>Amount</th>
                        <th style={{ padding: '8px' }}>Method</th>
                        <th style={{ padding: '8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsList.map(pay => (
                        <tr key={pay.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '8px' }}>Order #{pay.orderId}</td>
                          <td style={{ padding: '8px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{pay.transactionId}</td>
                          <td style={{ padding: '8px', color: 'var(--accent-neon)' }}>${pay.amount.toFixed(2)}</td>
                          <td style={{ padding: '8px', textTransform: 'lowercase' }}>{pay.paymentMethod}</td>
                          <td style={{ padding: '8px' }}>
                            <span className="badge badge-neon">{pay.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
