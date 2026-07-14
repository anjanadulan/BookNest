import { useMemo, useState, type CSSProperties } from "react"
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { accentBorders, categories, type Book } from "@/data/books"
import { useBookStore } from "@/state/book-store"

type CatalogPageProps = {
  onBack: () => void
  cartCount: number
  onAddToCart: (bookId: number) => void
  onOpenCart: () => void
  savedBooks: number[]
  onToggleSaved: (bookId: number) => void
  onSelectBook: (book: Book) => void
}

type SortOption = "featured" | "price-low" | "price-high" | "rating"

export function CatalogPage({
  onBack,
  cartCount,
  onAddToCart,
  onOpenCart,
  savedBooks,
  onToggleSaved,
  onSelectBook,
}: CatalogPageProps) {
  const { books } = useBookStore()
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All books")
  const [sortBy, setSortBy] = useState<SortOption>("featured")

  const visibleBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const matches = books.filter((book) => {
      const matchesCategory =
        activeCategory === "All books" || book.category === activeCategory
      const matchesQuery =
        !normalizedQuery ||
        `${book.title} ${book.author} ${book.category}`
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesCategory && matchesQuery
    })

    return [...matches].sort((first, second) => {
      if (sortBy === "price-low") return first.price - second.price
      if (sortBy === "price-high") return second.price - first.price
      if (sortBy === "rating")
        return Number(second.rating) - Number(first.rating)
      return first.id - second.id
    })
  }, [activeCategory, books, query, sortBy])

  return (
    <main className="min-h-screen bg-page text-ink selection:bg-lime selection:text-page">
      <header className="mx-auto flex h-[70px] max-w-[1360px] items-center justify-between border-b border-line px-6 md:h-[82px] md:px-10">
        <Button
          className="gap-2 bg-transparent px-0 text-xs text-muted hover:bg-transparent hover:text-ink"
          variant="ghost"
          type="button"
          onClick={onBack}
        >
          <ArrowLeft size={16} /> Back home
        </Button>
        <a
          className="hidden items-center gap-2.5 text-base font-semibold tracking-[-.04em] sm:inline-flex"
          href="#catalog-top"
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
        className="mx-auto max-w-[1160px] px-6 pt-16 pb-14 md:px-10 md:pt-24 md:pb-20"
        id="catalog-top"
      >
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-[700px]">
            <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
              01 / The collection
            </span>
            <h1 className="mt-6 font-display text-[clamp(3.8rem,8vw,7.2rem)] leading-[.86] font-normal tracking-[-.08em]">
              A shelf for
              <br />
              <em className="text-lime">every version.</em>
            </h1>
          </div>
          <div className="max-w-[250px] border-l border-lime pl-4 text-sm leading-[1.65] text-muted">
            <Sparkles className="mb-4 text-lime" size={18} />
            <p className="m-0">
              A small, considered collection of books worth making room for.
            </p>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-6 border-y border-line py-5 font-mono text-[10px] tracking-[.08em] text-dim uppercase md:grid-cols-4 md:gap-0">
          <span>
            <strong className="mr-2 text-ink">{books.length}</strong> handpicked
            titles
          </span>
          <span>
            <strong className="mr-2 text-ink">04</strong> categories
          </span>
          <span>
            <strong className="mr-2 text-ink">12k</strong> readers
          </span>
          <span>
            <strong className="mr-2 text-ink">24h</strong> digital access
          </span>
        </div>
      </section>

      <section
        className="mx-auto max-w-[1160px] px-6 pb-24 md:px-10"
        data-reveal-skip
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-[370px]">
            <Search
              className="absolute top-1/2 left-4 -translate-y-1/2 text-lime"
              size={17}
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles, authors, categories"
              aria-label="Search the book catalog"
              className="h-12 rounded-full border-line bg-surface pl-11 text-sm text-ink shadow-none placeholder:text-dim focus-visible:border-lime focus-visible:ring-1 focus-visible:ring-lime/30"
            />
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[.08em] text-dim uppercase">
            Sort by
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger
                className="h-10 min-w-[180px] border-line bg-surface px-4 text-[10px] tracking-[.08em] text-ink uppercase hover:bg-surface-light"
                aria-label="Sort books"
              >
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent
                className="!z-[100] !min-w-[220px] !bg-page p-1 !text-ink !shadow-[0_20px_50px_rgba(0,0,0,.16)]"
                align="end"
                alignItemWithTrigger={false}
                sideOffset={8}
              >
                <SelectItem
                  className="rounded-3xl px-3 py-2.5 text-[13px] font-normal focus:bg-surface-light"
                  value="featured"
                >
                  Featured
                </SelectItem>
                <SelectItem
                  className="rounded-3xl px-3 py-2.5 text-[13px] font-normal focus:bg-surface-light"
                  value="rating"
                >
                  Highest rated
                </SelectItem>
                <SelectItem
                  className="rounded-3xl px-3 py-2.5 text-[13px] font-normal focus:bg-surface-light"
                  value="price-low"
                >
                  Price: low to high
                </SelectItem>
                <SelectItem
                  className="rounded-3xl px-3 py-2.5 text-[13px] font-normal focus:bg-surface-light"
                  value="price-high"
                >
                  Price: high to low
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div
          className="mt-7 flex gap-3 overflow-x-auto border-b border-line pb-3"
          role="tablist"
          aria-label="Catalog categories"
        >
          {categories.map((category) => (
            <Toggle
              className={`h-auto shrink-0 rounded-full border px-4 py-2 font-mono text-[10px] font-normal tracking-[.05em] uppercase ${activeCategory === category ? "border-lime bg-lime text-page hover:bg-lime" : "border-line bg-transparent text-muted hover:bg-surface hover:text-ink"}`}
              variant="outline"
              key={category}
              type="button"
              pressed={activeCategory === category}
              aria-label={`Filter by ${category}`}
              onPressedChange={() => setActiveCategory(category)}
            >
              {category}
            </Toggle>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <p className="m-0 text-sm text-muted">
            Showing <strong className="text-ink">{visibleBooks.length}</strong>{" "}
            {visibleBooks.length === 1 ? "book" : "books"}
          </p>
          <span className="font-mono text-[10px] tracking-[.08em] text-dim uppercase">
            Updated for curious people
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-3 md:gap-6">
          {visibleBooks.map((book, index) => {
            const isSaved = savedBooks.includes(book.id)
            const isLowStock = book.stock < 50

            return (
              <article
                className="group min-w-0 animate-[card-in_500ms_cubic-bezier(.23,1,.32,1)_var(--card-delay)_both]"
                key={book.id}
                style={{ "--card-delay": `${index * 55}ms` } as CSSProperties}
              >
                <div
                  className={`image-zoom-frame relative aspect-[.76] border-b-[3px] bg-surface ${accentBorders[book.accent]}`}
                >
                  <img
                    className="catalog-book-image image-hover-smooth h-full w-full object-cover brightness-[.87] saturate-[.7]"
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
                    onClick={() => onToggleSaved(book.id)}
                  >
                    {isSaved ? <Check size={16} /> : <Bookmark size={16} />}
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
                    onClick={() => onAddToCart(book.id)}
                  >
                    Add to bag <ArrowUpRight size={15} />
                  </Button>
                </div>
                <div className="flex flex-col gap-3 pt-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <span className="font-mono text-[8px] tracking-[.12em] text-dim uppercase">
                      {book.category}
                    </span>
                    <button
                      className="mt-2 block text-left font-display text-lg leading-[1.05] tracking-[-.05em] transition-colors hover:text-lime md:text-xl"
                      type="button"
                      onClick={() => onSelectBook(book)}
                    >
                      {book.title}
                    </button>
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
                <div className="mt-3 flex items-center gap-2 font-mono text-[9px] tracking-[.06em] text-dim uppercase">
                  <span
                    className={`size-1.5 rounded-full ${isLowStock ? "bg-coral" : "bg-lime"}`}
                  />{" "}
                  {isLowStock ? `Only ${book.stock} left` : "In stock"}
                </div>
              </article>
            )
          })}
        </div>

        {visibleBooks.length === 0 && (
          <div className="mx-auto mt-12 flex max-w-[520px] flex-col items-center gap-3 border border-dashed border-line p-12 text-center">
            <Search className="text-lime" size={23} />
            <h2 className="font-display text-2xl font-normal">
              Nothing on this shelf yet.
            </h2>
            <p className="m-0 text-sm text-muted">
              Try a different title, author, or category.
            </p>
            <Button
              className="mt-2 h-auto bg-transparent p-0 text-xs text-lime underline hover:bg-transparent"
              variant="ghost"
              type="button"
              onClick={() => {
                setQuery("")
                setActiveCategory("All books")
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </section>

      <footer className="mx-auto flex max-w-[1160px] flex-col justify-between gap-5 border-t border-line px-6 py-7 font-mono text-[9px] tracking-[.08em] text-dim uppercase sm:flex-row md:px-10">
        <span>BookNest / The good shelf</span>
        <span>Made for long reads</span>
        <button
          className="text-left hover:text-ink sm:text-right"
          type="button"
          onClick={onBack}
        >
          Return home
        </button>
      </footer>
    </main>
  )
}
