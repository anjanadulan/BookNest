import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Star,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { books, type Book } from "@/data/books"

type BookDetailsPageProps = {
  book: Book
  cartCount: number
  onBack: () => void
  onOpenCart: () => void
  onAddToCart: (quantity: number) => void
  savedBooks: number[]
  onToggleSaved: (bookId: number) => void
  onSelectBook: (book: Book) => void
}

export function BookDetailsPage({
  book,
  cartCount,
  onBack,
  onOpenCart,
  onAddToCart,
  savedBooks,
  onToggleSaved,
  onSelectBook,
}: BookDetailsPageProps) {
  const [quantity, setQuantity] = useState(1)
  const isSaved = savedBooks.includes(book.id)
  const isLowStock = book.stock < 50

  const relatedBooks = useMemo(() => {
    return books
      .filter((candidate) => candidate.id !== book.id)
      .sort((first, second) => {
        if (
          first.category === book.category &&
          second.category !== book.category
        )
          return -1
        if (
          second.category === book.category &&
          first.category !== book.category
        )
          return 1
        return first.id - second.id
      })
      .slice(0, 3)
  }, [book])

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
          href="#details-top"
        >
          <span className="flex size-[30px] rotate-[-7deg] items-center justify-center rounded-lg bg-lime font-display text-[19px] text-page">
            B
          </span>
          booknest
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            className="gap-2 rounded-full border-line bg-transparent px-3 text-xs text-ink hover:bg-surface"
            variant="outline"
            type="button"
            onClick={onOpenCart}
          >
            <ShoppingBag size={17} />{" "}
            <span className="hidden sm:inline">Bag</span>
            <span className="flex size-5 items-center justify-center rounded-full bg-lime text-[10px] font-bold text-page">
              {cartCount}
            </span>
          </Button>
        </div>
      </header>

      <section
        className="mx-auto max-w-[1160px] px-6 pt-10 pb-20 md:px-10 md:pt-14 md:pb-28"
        id="details-top"
      >
        <div className="mb-10 flex items-center gap-2 font-mono text-[9px] tracking-[.12em] text-dim uppercase">
          <button className="hover:text-ink" type="button" onClick={onBack}>
            Collection
          </button>
          <ChevronRight size={12} />
          <span>{book.category}</span>
          <ChevronRight size={12} />
          <span className="max-w-[150px] truncate text-muted">
            {book.title}
          </span>
        </div>

        <div className="grid gap-12 md:grid-cols-[minmax(300px,.8fr)_minmax(0,1fr)] md:items-center md:gap-[9vw]">
          <div className="relative mx-auto w-full max-w-[480px] md:mx-0">
            <div className="absolute -inset-6 rounded-full bg-lime/10 blur-3xl" />
            <div className="group relative aspect-[.76] overflow-hidden border-b-4 border-lime bg-surface shadow-2xl shadow-page/50">
              <img
                className="h-full w-full object-cover brightness-[.9] saturate-[.72] transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                src={book.cover}
                alt={`${book.title} cover artwork`}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-page/75" />
              <Badge className="absolute top-5 left-5 rounded-none border-0 bg-lime px-2.5 py-1.5 font-mono text-[9px] font-normal tracking-[.12em] text-page uppercase">
                {book.format}
              </Badge>
              <span className="absolute bottom-5 left-5 font-mono text-[9px] tracking-[.12em] text-ink/70 uppercase">
                BookNest edition / 2026
              </span>
            </div>
            <div className="absolute -right-2 -bottom-5 rotate-3 rounded-full border border-line bg-surface px-3 py-2 font-mono text-[9px] tracking-[.08em] text-muted uppercase shadow-xl sm:-right-5">
              <span className="mr-2 inline-block size-1.5 rounded-full bg-lime" />{" "}
              {isLowStock ? `Only ${book.stock} left` : "In stock now"}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-[9px] tracking-[.12em] text-lime uppercase">
                {book.category} / A considered choice
              </span>
              <Button
                className={`size-9 rounded-full border-line p-0 ${isSaved ? "bg-lime text-page hover:bg-lime" : "bg-transparent text-muted hover:bg-surface hover:text-ink"}`}
                size="icon"
                variant="outline"
                type="button"
                aria-label={
                  isSaved
                    ? `Remove ${book.title} from saved books`
                    : `Save ${book.title}`
                }
                onClick={() => onToggleSaved(book.id)}
              >
                {isSaved ? <Check size={17} /> : <Bookmark size={17} />}
              </Button>
            </div>
            <h1 className="mt-7 max-w-[700px] font-display text-[clamp(3.4rem,7vw,6.5rem)] leading-[.85] font-normal tracking-[-.08em]">
              {book.title}
            </h1>
            <p className="mt-5 font-display text-xl tracking-[-.04em] text-muted italic">
              {book.author}
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-lime">
                <Star size={14} fill="currentColor" /> {book.rating}
              </span>
              <span className="size-1 rounded-full bg-dim" />
              <span className="text-muted">A reader favourite</span>
            </div>
            <p className="mt-8 max-w-[570px] text-[15px] leading-[1.75] text-muted">
              {book.description}
            </p>

            <div className="mt-9 flex flex-col gap-5 border-y border-line py-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
                  Digital edition
                </span>
                <strong className="mt-2 block text-2xl font-medium tracking-[-.05em]">
                  ${book.price.toFixed(2)}
                </strong>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-full border border-line bg-surface p-1">
                  <Button
                    className="size-8 rounded-full p-0 text-muted hover:bg-surface-light hover:text-ink"
                    size="icon-sm"
                    variant="ghost"
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                  >
                    <Minus size={14} />
                  </Button>
                  <span className="w-8 text-center text-xs">{quantity}</span>
                  <Button
                    className="size-8 rounded-full p-0 text-muted hover:bg-surface-light hover:text-ink"
                    size="icon-sm"
                    variant="ghost"
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() =>
                      setQuantity((current) => Math.min(9, current + 1))
                    }
                  >
                    <Plus size={14} />
                  </Button>
                </div>
                <Button
                  className="h-11 gap-4 rounded-full bg-lime px-5 text-xs text-page hover:bg-lime/90"
                  type="button"
                  onClick={() => onAddToCart(quantity)}
                >
                  Add to bag <ArrowUpRight size={17} />
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 font-mono text-[9px] tracking-[.06em] text-dim uppercase">
              <div>
                <span className="block text-ink">Instant</span>
                <span className="mt-1 block">access</span>
              </div>
              <div>
                <span className="block text-ink">{book.format}</span>
                <span className="mt-1 block">format</span>
              </div>
              <div>
                <span className="block text-ink">{book.stock}</span>
                <span className="mt-1 block">available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface/45">
        <div className="mx-auto grid max-w-[1160px] gap-8 px-6 py-12 md:grid-cols-[.7fr_1.3fr] md:px-10 md:py-16">
          <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
            A note from the shelf
          </span>
          <blockquote className="m-0 max-w-[720px] font-display text-[clamp(1.7rem,3vw,2.7rem)] leading-[1.05] tracking-[-.06em]">
            “Some books entertain you. The right ones quietly change the way you
            look at everything after them.”
          </blockquote>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-6 py-20 md:px-10 md:py-28">
        <div className="flex items-end justify-between gap-5">
          <div>
            <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
              More to explore
            </span>
            <h2 className="mt-5 font-display text-[clamp(2.8rem,5vw,4.5rem)] leading-[.9] font-normal tracking-[-.07em]">
              Keep the
              <br />
              <em className="text-lime">curiosity going.</em>
            </h2>
          </div>
          <span className="hidden font-mono text-[9px] tracking-[.08em] text-dim uppercase sm:inline">
            03 more books
          </span>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {relatedBooks.map((relatedBook) => (
            <article
              className="group cursor-pointer"
              key={relatedBook.id}
              onClick={() => onSelectBook(relatedBook)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ")
                  onSelectBook(relatedBook)
              }}
              role="button"
              tabIndex={0}
            >
              <div className="aspect-[.76] overflow-hidden border-b-2 border-line bg-surface">
                <img
                  className="h-full w-full object-cover brightness-[.85] saturate-[.7] transition duration-700 ease-out group-hover:scale-[1.04] group-hover:saturate-100"
                  src={relatedBook.cover}
                  alt={`${relatedBook.title} cover artwork`}
                />
              </div>
              <div className="flex items-end justify-between gap-3 pt-4">
                <div>
                  <span className="font-mono text-[8px] tracking-[.12em] text-dim uppercase">
                    {relatedBook.category}
                  </span>
                  <h3 className="mt-2 font-display text-lg leading-none font-normal tracking-[-.05em]">
                    {relatedBook.title}
                  </h3>
                  <p className="mt-1.5 text-[11px] text-muted">
                    {relatedBook.author}
                  </p>
                </div>
                <ArrowUpRight
                  className="text-lime transition-transform duration-200 ease-out group-hover:rotate-45"
                  size={17}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
