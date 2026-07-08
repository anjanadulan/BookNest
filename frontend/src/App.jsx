import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BookCard from './components/BookCard';
import CartSidebar from './components/CartSidebar';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import { Search, Plus, RefreshCw, Layers, ShieldAlert, CreditCard, UserCheck, AlertCircle, LogIn } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = sessionStorage.getItem('booknest_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeTab, setActiveTab] = useState('store');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = sessionStorage.getItem('booknest_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  }); // Used for both guest local storage and user database cart
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  
  // Loading states
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals & Sidebars
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminBookFormOpen, setIsAdminBookFormOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  // Admin Book Form State
  const [editingBook, setEditingBook] = useState(null);
  const [bookFormTitle, setBookFormTitle] = useState('');
  const [bookFormAuthor, setBookFormAuthor] = useState('');
  const [bookFormIsbn, setBookFormIsbn] = useState('');
  const [bookFormPrice, setBookFormPrice] = useState('');
  const [bookFormStock, setBookFormStock] = useState('');
  const [bookFormCategoryId, setBookFormCategoryId] = useState('');
  const [bookFormCoverUrl, setBookFormCoverUrl] = useState('');
  const [bookFormDescription, setBookFormDescription] = useState('');

  // Port Mappings
  const BOOK_API = 'http://localhost:8081/api';
  const CART_API = 'http://localhost:8082/api';
  const ORDER_API = 'http://localhost:8083/api';
  const PAYMENT_API = 'http://localhost:8084/api';
  const USER_API = 'http://localhost:8085/api/users';

  // Fetch initial books & categories
  const fetchCatalog = async () => {
    setLoadingBooks(true);
    try {
      const booksRes = await fetch(`${BOOK_API}/books`);
      if (booksRes.ok) {
        const booksData = await booksRes.json();
        setBooks(booksData);
      }
      
      const defaultCats = [
        { id: 1, name: 'Fiction' },
        { id: 2, name: 'Science' },
        { id: 3, name: 'History' },
        { id: 4, name: 'Biography' }
      ];
      setCategories(defaultCats);
    } catch (e) {
      console.error("Error fetching catalog: ", e);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleUpdateProfile = async (updatedUserPayload) => {
    try {
      const res = await fetch(USER_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserPayload)
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        sessionStorage.setItem('booknest_user', JSON.stringify(data));
        return true;
      }
    } catch (e) {
      console.error("Error updating profile: ", e);
    }
    return false;
  };

  // Fetch cart items for logged-in user
  const fetchCart = async () => {
    if (!currentUser || currentUser.role !== 'CUSTOMER') {
      return;
    }
    try {
      const res = await fetch(`${CART_API}/cart?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } catch (e) {
      console.error("Error fetching cart: ", e);
    }
  };

  // Fetch admin logs (orders & payments)
  const fetchAdminData = async () => {
    if (!currentUser || currentUser.role !== 'ADMIN') return;
    setLoadingOrders(true);
    try {
      const ordersRes = await fetch(`${ORDER_API}/orders`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
      const paymentsRes = await fetch(`${PAYMENT_API}/payments`);
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData);
      }
    } catch (e) {
      console.error("Error fetching admin logs: ", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Sync on mount & user switches
  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchCart();
      fetchAdminData();
      if (currentUser.role === 'ADMIN') {
        setIsCartOpen(false);
      } else {
        setActiveTab('store');
      }
    } else {
      // If logged out, reset admin logs and active tab to storefront
      setOrders([]);
      setPayments([]);
      setActiveTab('store');
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'admin') {
      fetchAdminData();
    }
  }, [activeTab]);

  // Sync guest cart to sessionStorage
  useEffect(() => {
    if (!currentUser) {
      sessionStorage.setItem('booknest_cart', JSON.stringify(cartItems));
    } else {
      sessionStorage.removeItem('booknest_cart');
    }
  }, [cartItems, currentUser]);

  // Auth actions
  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    sessionStorage.setItem('booknest_user', JSON.stringify(user));
    
    // If they have items in guest cart, migrate them to database
    if (user.role === 'CUSTOMER' && cartItems.length > 0) {
      try {
        for (const item of cartItems) {
          await fetch(`${CART_API}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              bookId: item.bookId,
              quantity: item.quantity
            })
          });
        }
      } catch (e) {
        console.error("Error migrating cart: ", e);
      }
    }

    // Refresh cart from database if Customer
    if (user.role === 'CUSTOMER') {
      const res = await fetch(`${CART_API}/cart?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } else if (user.role === 'ADMIN') {
      // Fetch admin data
      setLoadingOrders(true);
      try {
        const ordersRes = await fetch(`${ORDER_API}/orders`);
        if (ordersRes.ok) setOrders(await ordersRes.json());
        const paymentsRes = await fetch(`${PAYMENT_API}/payments`);
        if (paymentsRes.ok) setPayments(await paymentsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    }

    // If they had a checkout intent, trigger it directly
    if (pendingCheckout) {
      setIsCheckoutOpen(true);
      setPendingCheckout(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('booknest_user');
    sessionStorage.removeItem('booknest_cart');
    setCartItems([]);
    setOrders([]);
    setPayments([]);
    setActiveTab('store');
    setPendingCheckout(false);
  };

  // Cart operations
  const handleAddToCart = async (bookId) => {
    const existing = cartItems.find(item => item.bookId === bookId);
    
    // Guest Mode
    if (!currentUser) {
      if (existing) {
        setCartItems(cartItems.map(item => item.bookId === bookId ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
        setCartItems([...cartItems, { id: -Date.now(), bookId, quantity: 1, userId: null }]);
      }
      return;
    }

    // Logged-in User Mode
    if (existing) {
      handleUpdateCartQuantity(existing.id, existing.quantity + 1);
      return;
    }

    try {
      const res = await fetch(`${CART_API}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          bookId: bookId,
          quantity: 1
        })
      });
      if (res.ok) {
        fetchCart();
      }
    } catch (e) {
      alert("Error adding to cart: " + e.message);
    }
  };

  const handleUpdateCartQuantity = async (cartItemId, newQuantity) => {
    // Guest Mode
    if (!currentUser) {
      setCartItems(cartItems.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));
      return;
    }

    // Logged-in User Mode
    const item = cartItems.find(i => i.id === cartItemId);
    if (!item) return;

    try {
      const res = await fetch(`${CART_API}/cart`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cartItemId,
          userId: currentUser.id,
          bookId: item.bookId,
          quantity: newQuantity
        })
      });
      if (res.ok) {
        fetchCart();
      }
    } catch (e) {
      alert("Error updating quantity: " + e.message);
    }
  };

  const handleDeleteCartItem = async (cartItemId) => {
    // Guest Mode
    if (!currentUser) {
      setCartItems(cartItems.filter(item => item.id !== cartItemId));
      return;
    }

    // Logged-in User Mode
    try {
      const res = await fetch(`${CART_API}/cart/${cartItemId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCart();
      }
    } catch (e) {
      alert("Error deleting cart item: " + e.message);
    }
  };

  // Transaction orchestration (Order + Payment + Cart Clear)
  const handlePlaceOrder = async (orderPayload, paymentMethod) => {
    try {
      // 1. Post Order
      const orderRes = await fetch(`${ORDER_API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (!orderRes.ok) throw new Error("Order creation failed on backend");
      
      const createdOrder = await orderRes.json();
      const orderId = createdOrder.id;

      // 2. Post Payment
      const mockTxnId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}-MOCK`;
      const paymentPayload = {
        orderId: orderId,
        userId: currentUser.id,
        amount: orderPayload.totalAmount,
        paymentMethod: paymentMethod,
        status: 'SUCCESS',
        transactionId: mockTxnId,
        paymentDate: new Date().toISOString()
      };

      const paymentRes = await fetch(`${PAYMENT_API}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
      });
      if (!paymentRes.ok) throw new Error("Payment ledger record failed on backend");

      const createdPayment = await paymentRes.json();

      // 3. Clear Cart Items in Cart Service
      for (const item of cartItems) {
        await fetch(`${CART_API}/cart/${item.id}`, { method: 'DELETE' });
      }

      // Refresh states
      fetchCart();
      fetchCatalog();

      return {
        orderId: orderId,
        transactionId: createdPayment.transactionId,
        amount: createdPayment.amount,
        paymentMethod: createdPayment.paymentMethod,
        status: createdPayment.status
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // Admin Book Management
  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookFormTitle('');
    setBookFormAuthor('');
    setBookFormIsbn('');
    setBookFormPrice('');
    setBookFormStock('');
    setBookFormCoverUrl('');
    setBookFormDescription('');
    setBookFormCategoryId(categories[0]?.id || 1);
    setIsAdminBookFormOpen(true);
  };

  const handleOpenEditBook = (book) => {
    setEditingBook(book);
    setBookFormTitle(book.title);
    setBookFormAuthor(book.author);
    setBookFormIsbn(book.isbn || '');
    setBookFormPrice(book.price.toString());
    setBookFormStock(book.stock.toString());
    setBookFormCoverUrl(book.coverUrl || '');
    setBookFormDescription(book.description || '');
    setBookFormCategoryId(book.category?.id || 1);
    setIsAdminBookFormOpen(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      const res = await fetch(`${BOOK_API}/books/${bookId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCatalog();
      }
    } catch (e) {
      alert("Error deleting book: " + e.message);
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    const payload = {
      title: bookFormTitle,
      author: bookFormAuthor,
      isbn: bookFormIsbn,
      price: parseFloat(bookFormPrice),
      stock: parseInt(bookFormStock),
      coverUrl: bookFormCoverUrl,
      description: bookFormDescription,
      category: {
        id: parseInt(bookFormCategoryId)
      }
    };

    if (editingBook) {
      payload.id = editingBook.id;
    }

    try {
      const res = await fetch(`${BOOK_API}/books`, {
        method: editingBook ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsAdminBookFormOpen(false);
        fetchCatalog();
      }
    } catch (e) {
      alert("Error saving book: " + e.message);
    }
  };

  // Filter storefront list
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || book.category?.id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Navbar component */}
      <Navbar 
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* TAB 1: Storefront */}
        {activeTab === 'store' && (
          <div>
            {/* Search and category filters */}
            <div className="glass-card" style={{
              display: 'flex',
              gap: '16px',
              padding: '16px 24px',
              alignItems: 'center',
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexGrow: 1, position: 'relative' }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px' }} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books by title or author..."
                  style={{ width: '100%', paddingLeft: '42px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={18} color="var(--text-muted)" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ minWidth: '180px' }}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <button onClick={fetchCatalog} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {/* Books Grid */}
            {loadingBooks ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="glass-card skeleton" style={{ height: '300px' }} />
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <AlertCircle size={40} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '6px' }}>No Books Found</h3>
                <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search criteria or categories filter.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {filteredBooks.map(book => (
                  <BookCard 
                    key={book.id}
                    book={book}
                    currentUser={currentUser || { role: 'CUSTOMER' }} // Default role so guest gets customer storefront view
                    onAddToCart={handleAddToCart}
                    onEdit={handleOpenEditBook}
                    onDelete={handleDeleteBook}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Admin Dashboard Console */}
        {activeTab === 'admin' && currentUser && currentUser.role === 'ADMIN' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Welcome banner & Add Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Admin Console Dashboard</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Directly control catalog books, monitor placed orders, and trace payment ledgers.</p>
              </div>
              
              <button onClick={handleOpenAddBook} className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, #7209b7 100%)', boxShadow: 'none' }}>
                <Plus size={16} /> Add Catalog Book
              </button>
            </div>

            {/* Microservice statistics cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-secondary)' }}><Layers size={24} /></div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Catalog Items</span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{books.length} Books</h3>
                </div>
              </div>
              <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(0, 245, 212, 0.1)', color: 'var(--color-primary)' }}><UserCheck size={24} /></div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Orders Placed</span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{orders.length}</h3>
                </div>
              </div>
              <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(217, 70, 239, 0.1)', color: 'var(--color-accent)' }}><CreditCard size={24} /></div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transactions Audited</span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</h3>
                </div>
              </div>
            </div>

            {/* Orders & Payments auditing logs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
              
              {/* Order Auditing Table */}
              <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>Orders Ledger (`order-service`)</h3>
                {loadingOrders ? (
                  <div className="skeleton" style={{ height: '140px', borderRadius: '8px' }} />
                ) : orders.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No orders have been recorded in database.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px' }}>Order ID</th>
                        <th style={{ padding: '10px' }}>User ID</th>
                        <th style={{ padding: '10px' }}>Order Date</th>
                        <th style={{ padding: '10px' }}>Total Amount</th>
                        <th style={{ padding: '10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '12px 10px', fontWeight: 'bold' }}>#{o.id}</td>
                          <td style={{ padding: '12px 10px' }}>ID: {o.userId}</td>
                          <td style={{ padding: '12px 10px' }}>{new Date(o.orderDate).toLocaleString()}</td>
                          <td style={{ padding: '12px 10px', color: 'var(--color-primary)', fontWeight: 'bold' }}>${o.totalAmount.toFixed(2)}</td>
                          <td style={{ padding: '12px 10px' }}><span style={{ color: o.status === 'COMPLETED' ? '#10b981' : '#f59e0b', fontSize: '0.8rem', fontWeight: 'bold' }}>{o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Payments Auditing Table */}
              <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>Payments Ledger (`payment-service`)</h3>
                {loadingOrders ? (
                  <div className="skeleton" style={{ height: '140px', borderRadius: '8px' }} />
                ) : payments.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No payment records found.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px' }}>Transaction ID</th>
                        <th style={{ padding: '10px' }}>Order ID</th>
                        <th style={{ padding: '10px' }}>User ID</th>
                        <th style={{ padding: '10px' }}>Simulated Date</th>
                        <th style={{ padding: '10px' }}>Amount</th>
                        <th style={{ padding: '10px' }}>Method</th>
                        <th style={{ padding: '10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '12px 10px', color: 'var(--color-accent)', fontWeight: 'bold', fontFamily: 'monospace' }}>{p.transactionId}</td>
                          <td style={{ padding: '12px 10px' }}>#{p.orderId}</td>
                          <td style={{ padding: '12px 10px' }}>ID: {p.userId}</td>
                          <td style={{ padding: '12px 10px' }}>{new Date(p.paymentDate).toLocaleString()}</td>
                          <td style={{ padding: '12px 10px', color: 'var(--color-primary)', fontWeight: 'bold' }}>${p.amount.toFixed(2)}</td>
                          <td style={{ padding: '12px 10px' }}>{p.paymentMethod}</td>
                          <td style={{ padding: '12px 10px' }}><span style={{ color: p.status === 'SUCCESS' ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: User Profile Settings */}
        {activeTab === 'profile' && currentUser && (
          <UserProfile 
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>

      {/* Cart Sidebar drawer */}
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        books={books}
        onUpdateQuantity={handleUpdateCartQuantity}
        onDeleteItem={handleDeleteCartItem}
        onCheckout={() => {
          setIsCartOpen(false);
          if (!currentUser) {
            setPendingCheckout(true);
            setIsAuthModalOpen(true);
          } else {
            setIsCheckoutOpen(true);
          }
        }}
      />

      {/* Checkout Wizard modal */}
      {currentUser && (
        <CheckoutModal 
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          books={books}
          onPlaceOrder={handlePlaceOrder}
          currentUser={currentUser}
        />
      )}

      {/* Auth Modal (Login / Sign Up) */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingCheckout(false);
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Add/Edit Catalog Book Modal */}
      {isAdminBookFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0, left: 0,
          backgroundColor: 'rgba(5, 7, 12, 0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '500px',
            background: 'var(--bg-secondary)',
            padding: '30px',
            position: 'relative'
          }}>
            <button onClick={() => setIsAdminBookFormOpen(false)} className="btn-secondary" style={{ position: 'absolute', top: '20px', right: '20px', padding: '8px', borderRadius: '50%' }}>
              <X size={16} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>
              {editingBook ? 'Edit Book Details' : 'Add New Catalog Book'}
            </h2>

            <form onSubmit={handleSaveBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Book Title</label>
                <input type="text" required value={bookFormTitle} onChange={(e) => setBookFormTitle(e.target.value)} placeholder="e.g. The Lord of the Rings" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Author Name</label>
                <input type="text" required value={bookFormAuthor} onChange={(e) => setBookFormAuthor(e.target.value)} placeholder="e.g. J.R.R. Tolkien" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>ISBN Code</label>
                <input type="text" value={bookFormIsbn} onChange={(e) => setBookFormIsbn(e.target.value)} placeholder="e.g. 9780261102354" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cover Image URL</label>
                <input type="text" value={bookFormCoverUrl} onChange={(e) => setBookFormCoverUrl(e.target.value)} placeholder="e.g. https://images.unsplash.com/photo-..." />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Book Description</label>
                <textarea 
                  value={bookFormDescription} 
                  onChange={(e) => setBookFormDescription(e.target.value)} 
                  placeholder="Enter book synopsis or summary..."
                  rows={3}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '10px 12px',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Price ($)</label>
                  <input type="number" step="0.01" required value={bookFormPrice} onChange={(e) => setBookFormPrice(e.target.value)} placeholder="e.g. 19.99" />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Available Stock</label>
                  <input type="number" required value={bookFormStock} onChange={(e) => setBookFormStock(e.target.value)} placeholder="e.g. 50" />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Category Tag</label>
                <select value={bookFormCategoryId} onChange={(e) => setBookFormCategoryId(e.target.value)}>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsAdminBookFormOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, #7209b7 100%)', color: '#fff' }}>
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple absolute positioned X icon helper close button for forms
function X({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
