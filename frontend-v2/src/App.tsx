import { useEffect, useMemo, useState } from "react"
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
  ChevronRight,
  CircleUserRound,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SideRays from "@/components/SideRays"
import { ThemeToggle } from "@/components/theme-toggle"
import { type Book } from "@/data/books"
import { useLiquidGlass } from "@/hooks/use-liquid-glass"
import {
  createCartItem,
  createOrder,
  createPayment,
  deleteCartItem,
  deleteOrder,
  deletePayment,
  fetchBooks,
  fetchCart,
  fetchOrders,
  releaseBookStock,
  reserveBookStock,
  type ApiOrder,
  updateCartItem,
  updateOrder,
  updateUserProfile,
} from "@/lib/api"
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

const AUTH_STORAGE_KEY = "booknest.auth"

function readStoredUser(): AuthProfile | null {
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) return null

    const profile = JSON.parse(stored) as AuthProfile
    if (!profile.name || !profile.email) return null
    return profile
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
}

function mapApiOrder(order: ApiOrder): OrderRecord {
  return {
    id: `BN-${order.id}`,
    date: order.orderDate.slice(0, 10),
    total: Number(order.totalAmount),
    status:
      order.status.toUpperCase() === "COMPLETED" ? "Completed" : "Processing",
    items: (order.orderItems ?? []).map((item) => ({
      bookId: item.bookId,
      quantity: item.quantity,
    })),
    paymentMethod: "Card",
    transactionId: "",
  }
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const liquidHeaderRef = useLiquidGlass<HTMLElement>({
    scale: -92,
    chroma: 5,
    blur: 3,
    saturate: 1.5,
    fallbackBlur: 18,
  })
  const { books, refreshBooks } = useBookStore()
  const [query, setQuery] = useState("")
  const [cartItems, setCartItems] = useState<CartLine[]>([])
  const [savedBooks, setSavedBooks] = useState<number[]>([])
  const [user, setUser] = useState<AuthProfile | null>(readStoredUser)
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

  useEffect(() => {
    if (!user?.id) return
    let isActive = true

    void Promise.all([fetchCart(user.id), fetchOrders(user.id)])
      .then(([remoteCart, remoteOrders]) => {
        if (!isActive) return
        setCartItems(remoteCart)
        setOrders(remoteOrders.map(mapApiOrder))
      })
      .catch(() => {
        if (!isActive) return
        setCartItems([])
      })

    return () => {
      isActive = false
    }
  }, [user?.id])

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  )

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return books.filter((book) => {
      const matchesQuery =
        !normalizedQuery ||
        `${book.title} ${book.author} ${book.category}`
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesQuery
    })
  }, [books, query])

  function toggleSaved(bookId: number) {
    setSavedBooks((current) =>
      current.includes(bookId)
        ? current.filter((id) => id !== bookId)
        : [...current, bookId]
    )
  }

  function addToCart(bookId: number, quantity = 1) {
    const existing = cartItems.find((item) => item.bookId === bookId)
    setCartItems((current) => {
      if (existing) {
        return current.map((item) =>
          item.bookId === bookId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [...current, { bookId, quantity }]
    })

    if (user?.id) {
      if (existing?.id) {
        void updateCartItem({
          id: existing.id,
          userId: user.id,
          bookId,
          quantity: existing.quantity + quantity,
        })
      } else {
        void createCartItem({ userId: user.id, bookId, quantity }).then(
          (created) => {
            setCartItems((current) =>
              current.map((item) =>
                item.bookId === bookId
                  ? { ...item, id: created.id, userId: created.userId }
                  : item
              )
            )
          }
        )
      }
    }
  }

  function changeCartQuantity(bookId: number, quantity: number) {
    const currentItem = cartItems.find((item) => item.bookId === bookId)
    if (quantity < 1) {
      setCartItems((current) =>
        current.filter((item) => item.bookId !== bookId)
      )
      if (currentItem?.id) void deleteCartItem(currentItem.id)
      return
    }

    setCartItems((current) =>
      current.map((item) =>
        item.bookId === bookId ? { ...item, quantity } : item
      )
    )
    if (currentItem?.id && user?.id)
      void updateCartItem({
        id: currentItem.id,
        userId: user.id,
        bookId,
        quantity,
      })
  }

  function removeCartItem(bookId: number) {
    const currentItem = cartItems.find((item) => item.bookId === bookId)
    setCartItems((current) => current.filter((item) => item.bookId !== bookId))
    if (currentItem?.id) void deleteCartItem(currentItem.id)
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

  async function finishAuth(profile: AuthProfile) {
    setUser(profile)
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile))
    const returnTo = (location.state as { from?: string } | null)?.from ?? "/"
    navigate(returnTo, { replace: true, state: null })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function logout() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
    setCartItems([])
    setSavedBooks([])
    setCheckoutDetails(null)
    navigate("/", { replace: true })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openDetails(book: Book) {
    navigate(`/books/${book.id}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function returnHome() {
    setMenuOpen(false)
    navigate("/")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openHomeSection(sectionId: string) {
    setMenuOpen(false)

    if (location.pathname !== "/") {
      navigate("/")
      window.setTimeout(() => scrollToSection(sectionId), 80)
      return
    }

    scrollToSection(sectionId)
  }

  function handleCheckout() {
    openCheckout()
  }

  function saveProfile(profile: AuthProfile) {
    const profileId = user?.id
    setUser((current) => {
      const updatedProfile = {
        ...profile,
        id: current?.id,
        role: current?.role ?? profile.role,
      }
      window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      )
      return updatedProfile
    })
    if (profileId)
      void updateUserProfile({
        id: profileId,
        name: profile.name,
        email: profile.email,
      })
  }

  function continueToPayment(details: CheckoutDetails) {
    setCheckoutDetails(details)
    navigate("/payment")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function completePayment(payment: PaymentResult) {
    if (!user?.id) throw new Error("Please sign in before completing payment")

    if (cartItems.length === 0) throw new Error("Your cart is empty")

    const latestBooks = await fetchBooks()
    const latestById = new Map(latestBooks.map((book) => [book.id, book]))
    const orderItems = cartItems.map((item) => {
      const book = latestById.get(item.bookId)
      if (!book) throw new Error(`Book ${item.bookId} is no longer available`)
      if (book.stock < item.quantity)
        throw new Error(
          `Only ${book.stock} copy${book.stock === 1 ? "" : "ies"} of “${book.title}” remain`
        )
      return { bookId: item.bookId, quantity: item.quantity, price: book.price }
    })
    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const now = new Date().toISOString().slice(0, 19)
    const reservedItems: typeof cartItems = []
    let createdOrder: ApiOrder | undefined
    let createdPayment: Awaited<ReturnType<typeof createPayment>> | undefined

    try {
      for (const item of cartItems) {
        await reserveBookStock(item.bookId, item.quantity)
        reservedItems.push(item)
      }

      createdOrder = await createOrder({
        userId: user.id,
        totalAmount: total,
        status: "PENDING",
        orderDate: now,
        orderItems,
      })
      const transactionId = `TXN-${Date.now().toString().slice(-8)}-MOCK`
      createdPayment = await createPayment({
        orderId: createdOrder.id,
        userId: user.id,
        amount: total,
        paymentMethod: payment.paymentMethod,
        status: "SUCCESS",
        transactionId,
        paymentDate: now,
      })
      await updateOrder({
        ...createdOrder,
        status: "COMPLETED",
        orderItems: createdOrder.orderItems ?? orderItems,
      })
      await Promise.all(
        cartItems
          .filter((item) => item.id)
          .map((item) => deleteCartItem(item.id as number))
      )
      setOrders((current) => [
        {
          id: `BN-${createdOrder?.id}`,
          date: now.slice(0, 10),
          total,
          status: "Completed",
          items: cartItems,
          paymentMethod:
            payment.paymentMethod === "CREDIT_CARD"
              ? `Card ending ${payment.lastFour}`
              : payment.paymentMethod,
          transactionId,
        },
        ...current,
      ])
      setCartItems([])
      setCheckoutDetails(null)
      await refreshBooks()
      navigate("/orders")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (checkoutError) {
      if (createdPayment?.id) {
        try {
          await deletePayment(createdPayment.id)
        } catch {
          /* best-effort compensation */
        }
      }
      if (createdOrder?.id) {
        try {
          await updateOrder({
            ...createdOrder,
            status: "FAILED",
            orderItems: createdOrder.orderItems ?? orderItems,
          })
        } catch {
          try {
            await deleteOrder(createdOrder.id)
          } catch {
            /* keep the failed order for manual review */
          }
        }
      }
      await Promise.all(
        reservedItems.map((item) =>
          releaseBookStock(item.bookId, item.quantity).catch(() => undefined)
        )
      )
      await refreshBooks()
      throw checkoutError
    }
  }

  return (
    <>
      <header
        ref={liquidHeaderRef}
        className="liquid-glass-header fixed top-3 left-1/2 z-50 flex h-[64px] w-[calc(100%_-_24px)] max-w-[1240px] -translate-x-1/2 items-center justify-between rounded-full px-4 md:top-6 md:h-[60px] md:w-[calc(100%_-_48px)] md:px-8"
      >
        <button
          className="group inline-flex items-center gap-2.5 text-base font-semibold tracking-[-.04em]"
          type="button"
          aria-label="BookNest home"
          onClick={returnHome}
        >
          <span>BookNest</span>
        </button>

        <nav
          className={`${menuOpen ? "flex" : "hidden"} absolute inset-x-0 top-[calc(100%+10px)] flex-col gap-1 rounded-[24px] border border-line bg-page/90 px-6 py-4 shadow-[0_20px_60px_rgba(0,0,0,.3)] backdrop-blur-xl md:static md:flex md:flex-row md:gap-7 md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none`}
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
                if (label === "Browse") openCatalog()
                else openHomeSection(target)
                setMenuOpen(false)
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user?.role === "ADMIN" && (
            <Button
              className="hidden rounded-full border-line bg-transparent px-3 text-[10px] text-muted hover:bg-surface hover:text-ink lg:inline-flex"
              variant="outline"
              type="button"
              onClick={openAdmin}
            >
              Admin
            </Button>
          )}
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

      <div
        className={`route-content ${location.pathname === "/" ? "" : "pt-[88px] md:pt-[102px]"}`}
      >
        <Routes>
          <Route
            path="/"
            element={
              <main className="min-h-screen overflow-x-clip bg-page text-ink selection:bg-lime selection:text-page">
                <header className="liquid-glass-header sticky top-3 z-40 mx-auto mt-3 flex h-[64px] w-[calc(100%_-_24px)] max-w-[1240px] items-center justify-between rounded-full px-4 md:top-4 md:mt-4 md:h-[70px] md:w-[calc(100%_-_48px)] md:px-6">
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
                    className={`${menuOpen ? "flex" : "hidden"} absolute inset-x-0 top-[calc(100%+10px)] flex-col gap-1 rounded-[24px] border border-line bg-page/90 px-6 py-4 shadow-[0_20px_60px_rgba(0,0,0,.3)] backdrop-blur-xl md:static md:flex md:flex-row md:gap-7 md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none`}
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
                  <div className="hidden">
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
                  className="relative isolate flex min-h-[680px] items-center justify-center overflow-hidden px-6 py-24 md:min-h-[760px] md:px-10 md:py-32"
                  id="top"
                >
                  <div className="pointer-events-none absolute inset-0 -z-20">
                    <SideRays
                      speed={2.5}
                      rayColor1="#EAB308"
                      rayColor2="#96c8ff"
                      intensity={2}
                      spread={2}
                      origin="top-right"
                      tilt={0}
                      saturation={1.5}
                      blend={0.75}
                      falloff={1.6}
                      opacity={1}
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-page" />

                  <div className="relative z-10 mx-auto flex max-w-[980px] animate-[reveal-in_800ms_cubic-bezier(.23,1,.32,1)_90ms_both] flex-col items-center text-center">
                    <h1 className="mt-7 max-w-[940px] font-display text-[clamp(4rem,9vw,8.2rem)] leading-[.86] font-normal tracking-[-.075em] text-balance">
                      Stories for your{" "}
                      <em className="text-lime">next version.</em>
                    </h1>
                    <p className="mt-7 max-w-[540px] text-base leading-[1.7] text-balance text-muted md:text-lg">
                      Thoughtful books for curious minds. Find the ideas you
                      need, the stories you will keep, and a little more room to
                      think.
                    </p>
                    <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
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
                    <div className="mt-12 flex items-center justify-center gap-3.5 sm:mt-14">
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
                      Because your reading list should feel like a place you
                      want to be.
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
                    ].map(
                      ([number, lineOne, lineTwo, description, variant]) => (
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
                            className={`max-w-[155px] pt-3 text-[11px] leading-[1.55] ${variant === "highlight" ? "text-page/70" : "text-muted"}`}
                          >
                            {description}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>

                <section
                  className="mx-auto grid max-w-[1360px] gap-12 px-6 py-[90px] pb-[105px] md:grid-cols-[minmax(0,.95fr)_minmax(330px,.75fr)] md:items-center md:gap-[10vw] md:px-10 md:py-[145px] md:pb-[170px]"
                  id="journal"
                >
                  <div className="image-zoom-frame group relative aspect-[1.12]">
                    <img
                      className="image-hover-smooth h-full w-full object-cover saturate-[.62] sepia-[.12]"
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
                      Small essays, big ideas, and reading lists for the
                      in-between moments. A quiet corner for whatever has your
                      attention.
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
                  onLogout={logout}
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
      </div>
    </>
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
  const { books } = useBookStore()
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
