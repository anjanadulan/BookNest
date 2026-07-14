import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Book } from "@/data/books"
import { ThemeToggle } from "@/components/theme-toggle"
import { useBookStore } from "@/state/book-store"

export type CartLine = {
  id?: number
  userId?: number
  bookId: number
  quantity: number
}

type CartPageProps = {
  cartItems: CartLine[]
  cartCount: number
  isAuthenticated: boolean
  userName?: string
  onBack: () => void
  onContinueShopping: () => void
  onChangeQuantity: (bookId: number, quantity: number) => void
  onRemove: (bookId: number) => void
  onCheckout: () => void
}

export function CartPage({
  cartItems,
  cartCount,
  isAuthenticated,
  userName,
  onBack,
  onContinueShopping,
  onChangeQuantity,
  onRemove,
  onCheckout,
}: CartPageProps) {
  const { books } = useBookStore()
  const lines = cartItems
    .map((line) => ({
      ...line,
      book: books.find((book) => book.id === line.bookId),
    }))
    .filter((line): line is CartLine & { book: Book } => Boolean(line.book))
  const subtotal = lines.reduce(
    (total, line) => total + line.book.price * line.quantity,
    0
  )

  return (
    <main className="min-h-screen bg-page text-ink selection:bg-lime selection:text-page">
      <header className="mx-auto flex h-[70px] max-w-[1360px] items-center justify-between border-b border-line px-6 md:h-[82px] md:px-10">
        <Button
          className="gap-2 bg-transparent px-0 text-xs text-muted hover:bg-transparent hover:text-ink"
          variant="ghost"
          type="button"
          onClick={onBack}
        >
          <ArrowLeft size={16} /> Back to collection
        </Button>
        <a
          className="hidden items-center gap-2.5 text-base font-semibold tracking-[-.04em] sm:inline-flex"
          href="#cart-top"
        >
          <span className="flex size-[30px] rotate-[-7deg] items-center justify-center rounded-lg bg-lime font-display text-[19px] text-page">
            B
          </span>
          booknest
        </a>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="flex items-center gap-2 font-mono text-[10px] tracking-[.08em] text-muted uppercase">
            <ShoppingBag size={16} className="text-lime" /> {cartCount}{" "}
            {cartCount === 1 ? "item" : "items"}
          </span>
        </div>
      </header>

      <section
        className="mx-auto max-w-[1160px] px-6 pt-16 pb-24 md:px-10 md:pt-24 md:pb-32"
        id="cart-top"
      >
        <div className="flex flex-col justify-between gap-8 border-b border-line pb-12 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
              01 / Your shelf
            </span>
            <h1 className="mt-6 font-display text-[clamp(3.7rem,8vw,7.2rem)] leading-[.85] font-normal tracking-[-.08em]">
              A few good
              <br />
              <em className="text-lime">things.</em>
            </h1>
          </div>
          <p className="max-w-[250px] text-sm leading-[1.65] text-muted">
            Your selected reads, saved here until you are ready to make them
            yours.
          </p>
        </div>

        {lines.length === 0 ? (
          <div className="mx-auto flex max-w-[500px] flex-col items-center py-28 text-center">
            <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-surface text-lime">
              <ShoppingBag size={25} />
            </div>
            <h2 className="font-display text-3xl font-normal tracking-[-.06em]">
              Your shelf is waiting.
            </h2>
            <p className="mt-3 text-sm leading-[1.6] text-muted">
              Explore the collection and add a book that makes you want to stay
              up a little later.
            </p>
            <Button
              className="mt-7 h-auto gap-4 rounded-full bg-lime px-5 py-3.5 text-xs text-page hover:bg-lime/90"
              type="button"
              onClick={onContinueShopping}
            >
              Explore the collection <ArrowUpRight size={17} />
            </Button>
          </div>
        ) : (
          <div className="grid gap-14 pt-12 lg:grid-cols-[1.35fr_.65fr] lg:gap-20">
            <div>
              <div className="mb-5 flex items-center justify-between font-mono text-[9px] tracking-[.08em] text-dim uppercase">
                <span>
                  {lines.length} selected{" "}
                  {lines.length === 1 ? "title" : "titles"}
                </span>
                <span>Digital editions</span>
              </div>
              <div className="divide-y divide-line">
                {lines.map(({ book, quantity }) => (
                  <article
                    className="flex gap-4 py-6 first:pt-0 sm:gap-6"
                    key={book.id}
                  >
                    <div className="size-24 shrink-0 overflow-hidden border-b-2 border-lime bg-surface sm:size-32">
                      <img
                        className="h-full w-full object-cover saturate-[.75]"
                        src={book.cover}
                        alt={`${book.title} cover artwork`}
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-5 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <Badge className="rounded-none border-0 bg-surface px-2 py-1 font-mono text-[8px] font-normal tracking-[.1em] text-muted uppercase">
                          {book.category}
                        </Badge>
                        <h2 className="mt-3 truncate font-display text-xl font-normal tracking-[-.05em] sm:text-2xl">
                          {book.title}
                        </h2>
                        <p className="mt-1 text-[11px] text-muted">
                          {book.author}
                        </p>
                        <button
                          className="mt-3 flex items-center gap-1 text-[10px] text-dim hover:text-coral"
                          type="button"
                          onClick={() => onRemove(book.id)}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-7 sm:flex-col sm:items-end">
                        <strong className="text-sm font-medium">
                          ${(book.price * quantity).toFixed(2)}
                        </strong>
                        <div className="flex items-center rounded-full border border-line bg-surface p-1">
                          <Button
                            className="size-7 rounded-full p-0 text-muted hover:bg-surface-light hover:text-ink"
                            size="icon-sm"
                            variant="ghost"
                            type="button"
                            aria-label={`Decrease ${book.title} quantity`}
                            onClick={() =>
                              onChangeQuantity(book.id, quantity - 1)
                            }
                          >
                            <Minus size={13} />
                          </Button>
                          <span className="w-7 text-center text-xs">
                            {quantity}
                          </span>
                          <Button
                            className="size-7 rounded-full p-0 text-muted hover:bg-surface-light hover:text-ink"
                            size="icon-sm"
                            variant="ghost"
                            type="button"
                            aria-label={`Increase ${book.title} quantity`}
                            onClick={() =>
                              onChangeQuantity(book.id, quantity + 1)
                            }
                          >
                            <Plus size={13} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-2 border-t border-line pt-5 text-[11px] text-muted">
                <Bookmark className="text-lime" size={14} /> Your saved books
                are kept separately in your shelf.
              </div>
            </div>

            <aside className="h-fit bg-surface p-6 md:p-8 lg:sticky lg:top-8">
              <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
                02 / Order summary
              </span>
              <div className="mt-7 space-y-4 border-b border-line pb-6 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="text-ink">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Delivery</span>
                  <span className="text-lime">Included</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Access</span>
                  <span className="text-ink">Instant</span>
                </div>
              </div>
              <div className="flex items-end justify-between pt-6">
                <span className="font-mono text-[10px] tracking-[.08em] text-dim uppercase">
                  Total
                </span>
                <strong className="text-2xl font-medium tracking-[-.05em]">
                  ${subtotal.toFixed(2)}
                </strong>
              </div>
              <Button
                className="mt-7 h-12 w-full justify-between rounded-full bg-lime px-5 text-xs text-page hover:bg-lime/90"
                type="button"
                onClick={onCheckout}
              >
                {isAuthenticated
                  ? "Continue to checkout"
                  : "Sign in to checkout"}
                <ArrowUpRight size={17} />
              </Button>
              <p className="mt-4 text-center text-[10px] leading-[1.5] text-dim">
                {isAuthenticated
                  ? `Ready for you, ${userName ?? "reader"}.`
                  : "You will need a BookNest account before payment."}
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}
