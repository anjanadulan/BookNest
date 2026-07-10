import { useMemo, useState, type CSSProperties } from "react"
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom"
import {
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { accentBorders, categories, type Book } from "@/data/books"
import { createCartItem, createOrder, createPayment, deleteCartItem, fetchCart, fetchOrders, type ApiOrder, updateCartItem } from "@/lib/api"
import { AuthPage, type AuthProfile } from "@/pages/AuthPage"
import { AdminDashboardPage } from "@/pages/AdminDashboardPage"
import { BookDetailsPage } from "@/pages/BookDetailsPage"
import { CartPage, type CartLine } from "@/pages/CartPage"
import { CatalogPage } from "@/pages/CatalogPage"
import { CheckoutPage, type CheckoutDetails } from "@/pages/CheckoutPage"
import { OrderHistoryPage, type OrderRecord } from "@/pages/OrderHistoryPage"
import { PaymentPage, type PaymentResult } from "@/pages/PaymentPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { useBookStore } from "@/state/book-store"

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { books } = useBookStore()
  const [activeCategory, setActiveCategory] = useState("All books")
  const [query, setQuery] = useState("")
  const [cartItems, setCartItems] = useState<CartLine[]>([])
  const [savedBooks, setSavedBooks] = useState<number[]>([])
  const [user, setUser] = useState<AuthProfile | null>(null)
  const [checkoutDetails, setCheckoutDetails] =
    useState<CheckoutDetails | null>(null)
  const [orders, setOrders] = useState<OrderRecord[]>([
    {
      id: "BN-1024",
      date: "2026-07-09",
      total: 43.99,
      status: "Completed",
      items: [
        { bookId: 2, quantity: 1 },
        { bookId: 4, quantity: 1 },
      ],
      paymentMethod: "Credit Card",
      transactionId: "TXN-76839210-MOCK",
    },
  ])
  const [menuOpen, setMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  )

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return books.filter((book) => {
      const matchesCategory =
        activeCategory === "All books" || book.category === activeCategory
      const matchesQuery =
        !normalizedQuery ||
        `${book.title} ${book.author} ${book.category}`
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesCategory && matchesQuery
    })
  }, [activeCategory, query])

  function toggleSaved(bookId: number) {
    setSavedBooks((current) =>
      current.includes(bookId)
        ? current.filter((id) => id !== bookId)
        : [...current, bookId]
    )
  }

  function addToCart(bookId: number, quantity = 1) {
    setCartItems((current) => {
      const existing = current.find((item) => item.bookId === bookId)

      if (existing) {
        return current.map((item) =>
          item.bookId === bookId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [...current, { bookId, quantity }]
    })
  }

  function changeCartQuantity(bookId: number, quantity: number) {
    if (quantity < 1) {
      setCartItems((current) =>
        current.filter((item) => item.bookId !== bookId)
      )
      return
    }

    setCartItems((current) =>
      current.map((item) =>
        item.bookId === bookId ? { ...item, quantity } : item
      )
    )
  }

  function removeCartItem(bookId: number) {
    setCartItems((current) => current.filter((item) => item.bookId !== bookId))
  }

  function openCatalog() {
    navigate("/catalog")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openCart() {
    navigate("/cart")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openCheckout() {
    if (!user) {
      openAuth("/checkout")
      return
    }

    navigate("/checkout")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openOrders() {
    navigate("/orders")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openProfile() {
    if (!user) {
      openAuth("/")
      return
    }

    navigate("/profile")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openAdmin() {
    if (user?.role !== "ADMIN") return
    navigate("/admin")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openAuth(returnTo = "/") {
    navigate("/login", { state: { from: returnTo } })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function finishAuth(profile: AuthProfile) {
    setUser(profile)
    const returnTo = (location.state as { from?: string } | null)?.from ?? "/"
    navigate(returnTo, { replace: true, state: null })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openDetails(book: Book) {
    navigate(`/books/${book.id}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function returnHome() {
    navigate("/")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleCheckout() {
    openCheckout()
  }

  function saveProfile(profile: AuthProfile) {
    setUser((current) => ({ ...profile, role: current?.role ?? profile.role }))
  }

  function continueToPayment(details: CheckoutDetails) {
    setCheckoutDetails(details)
    navigate("/payment")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function completePayment(payment: PaymentResult) {
    const total = cartItems.reduce((sum, item) => {
      const book = books.find((candidate) => candidate.id === item.bookId)
      return sum + (book?.price ?? 0) * item.quantity
    }, 0)

    setOrders((current) => [
      {
        id: `BN-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().slice(0, 10),
        total,
        status: "Completed",
        items: cartItems,
        paymentMethod:
          payment.paymentMethod === "CREDIT_CARD"
            ? `Card ending ${payment.lastFour}`
            : payment.paymentMethod,
        transactionId: `TXN-${Date.now().toString().slice(-8)}-MOCK`,
      },
      ...current,
    ])
    setCartItems([])
    setCheckoutDetails(null)
    navigate("/orders")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="min-h-screen overflow-hidden bg-page text-ink selection:bg-lime selection:text-page">
            <header className="relative z-20 mx-auto flex h-[70px] max-w-[1360px] items-center justify-between border-b border-line px-6 md:h-[82px] md:px-10">
              <a
                className="group inline-flex items-center gap-2.5 text-base font-semibold tracking-[-.04em]"
                href="#top"
                aria-label="BookNest home"
              >
                <span className="flex size-[30px] rotate-[-7deg] items-center justify-center rounded-lg bg-lime font-display text-[19px] text-page transition-transform duration-200 ease-out group-hover:rotate-0">
                  B
                </span>
                <span>booknest</span>
              </a>

              <nav
                className={`${menuOpen ? "flex" : "hidden"} absolute inset-x-0 top-[70px] flex-col gap-1 border-b border-line bg-surface px-6 py-4 md:static md:flex md:flex-row md:gap-7 md:border-0 md:bg-transparent md:p-0`}
              >
                {[
                  ["Browse", "collection"],
                  ["Why BookNest", "why-booknest"],
                  ["The journal", "journal"],
                  ["About us", "footer"],
                ].map(([label, target]) => (
                  <button
                    className="text-left text-xs text-muted transition-colors duration-200 ease-out hover:text-ink md:text-center"
                    key={label}
                    type="button"
                    onClick={() => {
                      if (label === "Browse") {
                        openCatalog()
                      } else {
                        scrollToSection(target)
                      }
                      setMenuOpen(false)
                    }}
                  >
                    {label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  className="hidden size-9 rounded-full border border-transparent bg-transparent p-0 text-muted hover:bg-surface hover:text-ink md:inline-flex"
                  size="icon"
                  variant="ghost"
                  type="button"
                  aria-label="Search books"
                  onClick={() => setShowSearch((current) => !current)}
                >
                  {showSearch ? <X size={18} /> : <Search size={18} />}
                </Button>
                <Button
                  className="hidden size-9 rounded-full border border-transparent bg-transparent p-0 text-muted hover:bg-surface hover:text-ink md:inline-flex"
                  size="icon"
                  variant="ghost"
                  type="button"
                  aria-label={user ? "Open profile" : "Open account"}
                  onClick={openProfile}
                >
                  <CircleUserRound size={18} />
                </Button>
                <Button
                  className="ml-0 gap-2 rounded-full border-line bg-transparent px-3 text-xs text-ink hover:border-ink/30 hover:bg-surface"
                  variant="outline"
                  type="button"
                  onClick={openCart}
                >
                  <ShoppingBag size={17} />{" "}
                  <span className="hidden sm:inline">Bag</span>
                  <span className="flex size-5 items-center justify-center rounded-full bg-lime text-[10px] font-bold text-page">
                    {cartCount}
                  </span>
                </Button>
                <Button
                  className="inline-flex size-9 rounded-full border border-transparent bg-transparent p-0 text-muted hover:bg-surface hover:text-ink md:hidden"
                  size="icon"
                  variant="ghost"
                  type="button"
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  onClick={() => setMenuOpen((current) => !current)}
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
              </div>
            </header>

            {showSearch && (
              <div className="relative z-10 mx-auto flex max-w-[1360px] items-center gap-3 border-b border-line bg-surface/95 px-6 py-4 md:px-10">
                <Search className="text-lime" size={18} />
                <Input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by title, author, or category..."
                  aria-label="Search books"
                  className="h-9 border-0 bg-transparent px-0 text-sm text-ink shadow-none placeholder:text-dim focus-visible:ring-0"
                />
                <span className="hidden font-mono text-[10px] text-dim uppercase sm:inline">
                  {filteredBooks.length} results
                </span>
              </div>
            )}

            <section
              className="mx-auto grid max-w-[1360px] gap-20 px-6 py-[70px] md:min-h-[650px] md:grid-cols-[minmax(0,.9fr)_minmax(430px,.85fr)] md:gap-[7vw] md:px-10 md:py-[88px] lg:py-[110px]"
              id="top"
            >
              <div className="animate-[reveal-in_800ms_cubic-bezier(.23,1,.32,1)_90ms_both] self-center md:pl-[4vw]">
                <div className="flex items-center gap-2 text-[10px] tracking-[.12em] text-muted uppercase">
                  <span className="size-1.5 rounded-full bg-lime shadow-[0_0_14px_rgba(216,243,106,.65)]" />{" "}
                  A better kind of bookshop
                </div>
                <h1 className="mt-6 max-w-[670px] font-display text-[clamp(3.6rem,7.1vw,6.75rem)] leading-[.92] font-normal tracking-[-.07em]">
                  Stories for your <em className="text-lime">next version.</em>
                </h1>
                <p className="mt-6 max-w-[405px] text-base leading-[1.65] text-muted">
                  Thoughtful books for curious minds. Find the ideas you need,
                  the stories you will keep, and a little more room to think.
                </p>
                <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
                  <Button
                    className="h-auto gap-4 rounded-full bg-lime px-5 py-3.5 text-xs text-page shadow-[0_12px_35px_rgba(216,243,106,.11)] hover:bg-lime/90 hover:shadow-[0_15px_40px_rgba(216,243,106,.2)]"
                    type="button"
                    onClick={openCatalog}
                  >
                    Explore the collection <ArrowUpRight size={17} />
                  </Button>
                  <Button
                    className="gap-1 bg-transparent px-0 text-xs text-muted hover:bg-transparent hover:text-ink"
                    variant="ghost"
                    type="button"
                    onClick={() => scrollToSection("journal")}
                  >
                    Read the journal <ChevronRight size={16} />
                  </Button>
                </div>
                <div className="mt-12 flex items-center gap-3.5 sm:mt-14">
                  <div className="flex">
                    {[
                      ["J", "bg-coral text-page"],
                      ["M", "bg-blue text-page"],
                      ["R", "bg-violet text-page"],
                      ["+", "bg-surface text-muted"],
                    ].map(([letter, color], index) => (
                      <span
                        className={`${color} ${index ? "-ml-2" : ""} flex size-[29px] items-center justify-center rounded-full border-2 border-page font-mono text-[9px]`}
                        key={letter}
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                  <div>
                    <div className="flex gap-px text-lime">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} size={13} fill="currentColor" />
                      ))}
                    </div>
                    <span className="mt-1 block text-[11px] text-dim">
                      Loved by 12,000+ readers
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative h-[min(112vw,470px)] w-[calc(100%-30px)] max-w-[530px] animate-[reveal-in_800ms_cubic-bezier(.23,1,.32,1)_190ms_both] self-center justify-self-center sm:h-[500px] sm:w-full md:justify-self-end">
                <span className="absolute -top-7 -right-0 font-mono text-[10px] text-muted">
                  01 / 04
                </span>
                <div className="group relative h-full rotate-[2.5deg] overflow-hidden transition-transform duration-500 ease-out hover:rotate-0">
                  <img
                    className="h-full w-full object-cover contrast-[1.08] saturate-[.72] transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                    src={books[0].cover}
                    alt="The Great Gatsby cover artwork"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-page/85" />
                  <div className="absolute inset-x-7 bottom-7 flex items-end justify-between">
                    <div>
                      <span className="font-mono text-[9px] tracking-[.12em] text-lime uppercase">
                        The current shelf
                      </span>
                      <h2 className="mt-2 font-display text-[clamp(1.9rem,3.5vw,2.95rem)] leading-[.95] font-normal tracking-[-.06em]">
                        The Great Gatsby
                      </h2>
                      <p className="mt-2 text-xs text-ink/70">
                        F. Scott Fitzgerald
                      </p>
                    </div>
                    <Button
                      className="size-[50px] rounded-full bg-lime p-0 text-page transition-transform duration-200 ease-out hover:rotate-45 hover:bg-lime"
                      size="icon"
                      type="button"
                      aria-label="Add featured book to bag"
                      onClick={() => addToCart(books[0].id)}
                    >
                      <ArrowUpRight size={20} />
                    </Button>
                  </div>
                </div>
                <div className="absolute top-[18%] -left-4 z-10 flex -rotate-7 items-center gap-2 rounded-full border border-line bg-surface/90 px-2.5 py-2 text-[11px] text-ink shadow-xl sm:-left-7">
                  <Sparkles className="text-lime" size={15} /> Freshly picked
                </div>
                <div className="absolute -right-4 bottom-[12%] z-10 flex rotate-6 items-center gap-2 rounded-full border border-line bg-surface/90 px-2.5 py-2 text-[11px] text-ink shadow-xl sm:-right-7">
                  <Clock3 className="text-lime" size={15} /> 6 min to browse
                </div>
                <span className="pointer-events-none absolute -top-10 -left-7 -z-10 h-[580px] w-[350px] rotate-[-26deg] rounded-[50%] border border-lime/20" />
                <span className="pointer-events-none absolute -top-[90px] left-[170px] -z-10 h-[690px] w-[200px] rotate-[41deg] rounded-[50%] border border-coral/20" />
              </div>
            </section>

            <section
              className="overflow-hidden border-y border-line py-4"
              aria-label="BookNest promise"
            >
              <div className="flex w-max animate-[ticker-slide_28s_linear_infinite] items-center justify-center gap-8 font-mono text-[10px] tracking-[.11em] whitespace-nowrap text-muted uppercase motion-reduce:animate-none">
                <span>Read slower</span>
                <i className="text-sm text-coral not-italic">✳</i>
                <span>Think deeper</span>
                <i className="text-sm text-coral not-italic">✳</i>
                <span>Keep the good parts</span>
                <i className="text-sm text-coral not-italic">✳</i>
                <span>Read slower</span>
                <i className="text-sm text-coral not-italic">✳</i>
                <span>Think deeper</span>
                <i className="text-sm text-coral not-italic">✳</i>
                <span>Keep the good parts</span>
              </div>
            </section>

            <section
              className="mx-auto max-w-[1360px] px-6 py-[90px] md:px-10 md:py-[145px]"
              id="collection"
            >
              <div className="mx-auto mb-10 flex max-w-[1160px] flex-col items-start gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
                    02 / The collection
                  </span>
                  <h2 className="mt-6 font-display text-[clamp(3.2rem,5.4vw,4.9rem)] leading-[.92] font-normal tracking-[-.07em]">
                    Find your next
                    <br />
                    <em className="text-lime">good read.</em>
                  </h2>
                </div>
                <p className="mb-1 max-w-[275px] text-sm leading-[1.65] text-muted">
                  No endless shelves. Just books with something to say, selected
                  for where you are and where you might be going.
                </p>
              </div>
              <div className="mx-auto mb-7 flex max-w-[1160px] flex-col items-start gap-3 border-b border-line pb-2 md:flex-row md:items-center md:justify-between">
                <div
                  className="flex max-w-full gap-4 overflow-x-auto md:gap-6"
                  role="tablist"
                  aria-label="Book categories"
                >
                  {categories.map((category) => (
                    <Button
                      className={`h-auto rounded-none border-b px-0 py-2 font-mono text-[10px] font-normal tracking-[.05em] ${activeCategory === category ? "border-lime text-ink" : "border-transparent bg-transparent text-dim hover:bg-transparent hover:text-ink"}`}
                      variant="ghost"
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={activeCategory === category}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                <Button
                  className="hidden h-auto gap-2 bg-transparent px-0 font-mono text-[10px] font-normal text-dim hover:bg-transparent hover:text-ink md:inline-flex"
                  variant="ghost"
                  type="button"
                  onClick={openCatalog}
                >
                  <Search className="text-lime" size={15} /> Search collection
                </Button>
              </div>
              <div className="mx-auto grid max-w-[1160px] grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-4 md:gap-6">
                {filteredBooks.map((book, index) => {
                  const isSaved = savedBooks.includes(book.id)
                  return (
                    <article
                      className="group min-w-0 animate-[card-in_500ms_cubic-bezier(.23,1,.32,1)_var(--card-delay)_both]"
                      key={book.id}
                      style={
                        { "--card-delay": `${index * 55}ms` } as CSSProperties
                      }
                    >
                      <div
                        className={`relative aspect-[.76] overflow-hidden border-b-[3px] bg-surface ${accentBorders[book.accent]}`}
                      >
                        <img
                          className="h-full w-full object-cover brightness-[.87] saturate-[.7] transition duration-700 ease-out group-hover:scale-[1.04] group-hover:brightness-100 group-hover:saturate-100"
                          src={book.cover}
                          alt={`${book.title} cover artwork`}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-page/75" />
                        <Button
                          className={`absolute top-3 right-3 size-8 rounded-full border border-ink/20 bg-page/45 p-0 text-ink hover:scale-105 hover:bg-page/70 ${isSaved ? "bg-lime text-page hover:bg-lime" : ""}`}
                          size="icon-sm"
                          variant="ghost"
                          type="button"
                          aria-label={
                            isSaved
                              ? `Remove ${book.title} from saved books`
                              : `Save ${book.title}`
                          }
                          onClick={() => toggleSaved(book.id)}
                        >
                          {isSaved ? (
                            <Check size={16} />
                          ) : (
                            <Bookmark size={16} />
                          )}
                        </Button>
                        <Badge
                          variant="outline"
                          className="absolute bottom-3 left-3 rounded-none border-0 bg-page/60 px-2 py-1 font-mono text-[8px] font-normal tracking-[.12em] text-ink uppercase"
                        >
                          {book.format}
                        </Badge>
                        <Button
                          className="absolute right-3 bottom-3 h-auto translate-y-0 gap-1 rounded-none bg-lime px-2.5 py-2 text-[10px] text-page opacity-100 hover:bg-lime/90 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
                          type="button"
                          onClick={() => addToCart(book.id)}
                        >
                          Add to bag <ArrowUpRight size={15} />
                        </Button>
                      </div>
                      <div className="flex flex-col gap-3 pt-4 md:flex-row md:items-end md:justify-between">
                        <div>
                          <span className="font-mono text-[8px] tracking-[.12em] text-dim uppercase">
                            {book.category}
                          </span>
                          <h3 className="mt-2 font-display text-lg leading-[1.05] font-normal tracking-[-.05em] md:text-xl">
                            {book.title}
                          </h3>
                          <p className="mt-1.5 text-[11px] text-muted">
                            {book.author}
                          </p>
                        </div>
                        <div className="flex w-full flex-row-reverse justify-between gap-3 md:w-auto md:flex-col md:items-end">
                          <span className="flex items-center gap-1 font-mono text-[10px] text-lime">
                            <Star size={12} fill="currentColor" /> {book.rating}
                          </span>
                          <strong className="text-[13px] font-medium">
                            ${book.price.toFixed(2)}
                          </strong>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
              {filteredBooks.length === 0 && (
                <div className="mx-auto mt-10 flex max-w-[500px] flex-col items-center gap-3 border border-dashed border-line p-11 text-center text-muted">
                  <Search className="text-lime" size={22} />
                  <p className="m-0 text-[13px]">
                    No books found. Try a different title or category.
                  </p>
                  <Button
                    className="h-auto bg-transparent p-0 text-xs text-lime underline hover:bg-transparent"
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setQuery("")
                      setActiveCategory("All books")
                    }}
                  >
                    Reset search
                  </Button>
                </div>
              )}
            </section>

            <section
              className="mx-auto grid max-w-[1360px] gap-12 px-6 py-[90px] md:grid-cols-[.75fr_1.25fr] md:gap-20 md:px-10 md:py-[145px]"
              id="why-booknest"
            >
              <div className="pt-2">
                <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
                  03 / The BookNest way
                </span>
                <h2 className="mt-6 font-display text-[clamp(3.2rem,5.4vw,4.9rem)] leading-[.92] font-normal tracking-[-.07em]">
                  A little more
                  <br />
                  <em className="text-lime">human.</em>
                </h2>
                <p className="mt-7 max-w-[210px] text-sm leading-[1.6] text-muted">
                  Because your reading list should feel like a place you want to
                  be.
                </p>
              </div>
              <div className="flex overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
                {[
                  [
                    "01",
                    "Good books,",
                    "carefully found.",
                    "Our shelves are small on purpose. Every title earns its place.",
                    "highlight",
                  ],
                  [
                    "02",
                    "Made for",
                    "the long read.",
                    "Beautiful digital editions that stay out of the way of the words.",
                    "",
                  ],
                  [
                    "03",
                    "Your shelf,",
                    "wherever you are.",
                    "Save your finds and pick up exactly where your curiosity left off.",
                    "",
                  ],
                ].map(([number, lineOne, lineTwo, description, variant]) => (
                  <div
                    className={`min-h-[280px] min-w-[72vw] border-l border-line px-6 pt-2 transition duration-300 ease-out hover:-translate-y-1 hover:bg-surface md:min-h-[310px] md:min-w-0 ${variant === "highlight" ? "border-l-0 bg-lime text-page hover:bg-lime" : ""}`}
                    key={number}
                  >
                    <span className="font-mono text-[9px] opacity-55">
                      {number}
                    </span>
                    <span className="mt-14 block text-2xl">
                      {number === "01" ? (
                        <Sparkles size={22} />
                      ) : number === "02" ? (
                        "↗"
                      ) : (
                        "◎"
                      )}
                    </span>
                    <h3 className="mt-5 font-display text-[25px] leading-[.96] font-normal tracking-[-.06em]">
                      {lineOne}
                      <br />
                      {lineTwo}
                    </h3>
                    <p
                      className={`max-w-[155px] text-[11px] leading-[1.55] ${variant === "highlight" ? "text-page/70" : "text-muted"}`}
                    >
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section
              className="mx-auto grid max-w-[1360px] gap-12 px-6 py-[90px] pb-[105px] md:grid-cols-[minmax(0,.95fr)_minmax(330px,.75fr)] md:items-center md:gap-[10vw] md:px-10 md:py-[145px] md:pb-[170px]"
              id="journal"
            >
              <div className="group relative aspect-[1.12] overflow-hidden">
                <img
                  className="h-full w-full object-cover saturate-[.62] sepia-[.12] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  src={books[2].cover}
                  alt="Open book beside a coffee cup"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-page/50 to-transparent" />
                <span className="absolute bottom-6 left-6 z-10 font-mono text-[9px] tracking-[.12em] text-ink uppercase">
                  Notes from the shelf
                </span>
              </div>
              <div>
                <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
                  04 / The journal
                </span>
                <h2 className="mt-6 font-display text-[clamp(3rem,5.5vw,4.75rem)] leading-[.92] font-normal tracking-[-.07em]">
                  For the days
                  <br />
                  you want to <em className="text-lime">wander.</em>
                </h2>
                <p className="mt-7 max-w-[315px] text-sm leading-[1.65] text-muted">
                  Small essays, big ideas, and reading lists for the in-between
                  moments. A quiet corner for whatever has your attention.
                </p>
                <Button
                  className="mt-5 h-auto gap-4 rounded-full border border-line bg-surface-light px-5 py-3.5 text-xs text-ink hover:-translate-y-0.5 hover:bg-lime hover:text-page"
                  variant="outline"
                  type="button"
                >
                  Visit the journal <ArrowUpRight size={17} />
                </Button>
                <div className="mt-14 flex justify-between border-t border-line pt-3 font-mono text-[9px] text-dim uppercase">
                  <span>New this week</span>
                  <span>05.24</span>
                </div>
              </div>
            </section>

            <footer
              className="mx-auto max-w-[1360px] border-t border-line px-6 pt-12 pb-5 md:px-10 md:pt-16"
              id="footer"
            >
              <div className="flex flex-col justify-between gap-14 md:flex-row md:items-start">
                <div>
                  <a
                    className="inline-flex items-center gap-2.5 text-[19px] font-semibold tracking-[-.04em]"
                    href="#top"
                  >
                    <span className="flex size-[30px] items-center justify-center rounded-lg bg-lime font-display text-[19px] text-page">
                      B
                    </span>
                    <span>booknest</span>
                  </a>
                  <p className="mt-7 font-display text-[22px] tracking-[-.05em] text-muted">
                    Make room for a good story.
                  </p>
                </div>
                <div className="w-full md:w-[310px]">
                  <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
                    A note from us, occasionally
                  </span>
                  <div className="mt-4 flex border-b border-line pb-3">
                    <Input
                      type="email"
                      placeholder="Your email address"
                      aria-label="Your email address"
                      className="h-8 border-0 bg-transparent px-0 text-xs text-ink shadow-none placeholder:text-dim focus-visible:ring-0"
                    />
                    <Button
                      className="size-7 rounded-full bg-lime p-0 text-page hover:rotate-45 hover:bg-lime"
                      size="icon-xs"
                      type="button"
                      aria-label="Subscribe to the newsletter"
                    >
                      <ArrowUpRight size={18} />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-[70px] grid grid-cols-2 gap-5 border-t border-line pt-3 font-mono text-[9px] text-dim uppercase md:grid-cols-3">
                <span>© 2026 BookNest</span>
                <div className="col-start-1 row-start-2 flex flex-col gap-2 md:col-start-2 md:row-start-1 md:flex-row md:justify-center md:gap-5">
                  <a className="hover:text-ink" href="#footer">
                    Instagram
                  </a>
                  <a className="hover:text-ink" href="#footer">
                    Goodreads
                  </a>
                  <a className="hover:text-ink" href="#footer">
                    Contact
                  </a>
                </div>
                <span className="col-start-2 row-start-2 text-right md:row-start-1">
                  Built for curious people
                </span>
              </div>
            </footer>
          </main>
        }
      />
      <Route
        path="/catalog"
        element={
          <CatalogPage
            onBack={returnHome}
            cartCount={cartCount}
            onAddToCart={addToCart}
            onOpenCart={openCart}
            savedBooks={savedBooks}
            onToggleSaved={toggleSaved}
            onSelectBook={openDetails}
          />
        }
      />
      <Route
        path="/books/:bookId"
        element={
          <BookDetailsRoute
            cartCount={cartCount}
            addToCart={addToCart}
            savedBooks={savedBooks}
            onToggleSaved={toggleSaved}
            onOpenCart={openCart}
          />
        }
      />
      <Route
        path="/login"
        element={<AuthPage onBack={returnHome} onSuccess={finishAuth} />}
      />
      <Route
        path="/register"
        element={<AuthPage onBack={returnHome} onSuccess={finishAuth} />}
      />
      <Route
        path="/cart"
        element={
          <CartPage
            cartItems={cartItems}
            cartCount={cartCount}
            isAuthenticated={Boolean(user)}
            userName={user?.name}
            onBack={openCatalog}
            onContinueShopping={openCatalog}
            onChangeQuantity={changeCartQuantity}
            onRemove={removeCartItem}
            onCheckout={handleCheckout}
          />
        }
      />
      <Route
        path="/checkout"
        element={
          user && cartItems.length > 0 ? (
            <CheckoutPage
              cartItems={cartItems}
              user={user}
              onBack={openCart}
              onContinueToPayment={continueToPayment}
            />
          ) : (
            <Navigate
              to={user ? "/cart" : "/login"}
              state={user ? undefined : { from: "/checkout" }}
              replace
            />
          )
        }
      />
      <Route
        path="/payment"
        element={
          user && checkoutDetails && cartItems.length > 0 ? (
            <PaymentPage
              cartItems={cartItems}
              details={checkoutDetails}
              onBack={() => navigate("/checkout")}
              onComplete={completePayment}
            />
          ) : (
            <Navigate
              to={user ? "/checkout" : "/login"}
              state={user ? undefined : { from: "/payment" }}
              replace
            />
          )
        }
      />
      <Route
        path="/orders"
        element={
          user ? (
            <OrderHistoryPage
              orders={orders}
              onBack={returnHome}
              onContinueShopping={openCatalog}
            />
          ) : (
            <Navigate to="/login" state={{ from: "/orders" }} replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          user ? (
            <ProfilePage
              user={user}
              orders={orders}
              savedBooks={savedBooks}
              onBack={returnHome}
              onSaveProfile={saveProfile}
              onToggleSaved={toggleSaved}
              onViewOrders={openOrders}
              onOpenAdmin={openAdmin}
              onSelectBook={openDetails}
            />
          ) : (
            <Navigate to="/login" state={{ from: "/profile" }} replace />
          )
        }
      />
      <Route
        path="/admin"
        element={
          user?.role === "ADMIN" ? (
            <AdminDashboardPage
              orders={orders}
              onBack={openProfile}
              onOpenStore={openCatalog}
            />
          ) : user ? (
            <Navigate to="/profile" replace />
          ) : (
            <Navigate to="/login" state={{ from: "/admin" }} replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function BookDetailsRoute({
  cartCount,
  addToCart,
  savedBooks,
  onToggleSaved,
  onOpenCart,
}: {
  cartCount: number
  addToCart: (bookId: number, quantity?: number) => void
  savedBooks: number[]
  onToggleSaved: (bookId: number) => void
  onOpenCart: () => void
}) {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const book = books.find((candidate) => candidate.id === Number(bookId))

  if (!book) return <Navigate to="/catalog" replace />

  return (
    <BookDetailsPage
      book={book}
      cartCount={cartCount}
      onBack={() => navigate("/catalog")}
      onOpenCart={onOpenCart}
      onAddToCart={(quantity) => addToCart(book.id, quantity)}
      savedBooks={savedBooks}
      onToggleSaved={onToggleSaved}
      onSelectBook={(selectedBook) => navigate(`/books/${selectedBook.id}`)}
    />
  )
}

export default App
