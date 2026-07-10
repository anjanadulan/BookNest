import { useState } from "react"
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronRight,
  Mail,
  Settings2,
  ShoppingBag,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { books, type Book } from "@/data/books"
import type { AuthProfile } from "@/pages/AuthPage"
import type { OrderRecord } from "@/pages/OrderHistoryPage"

type ProfilePageProps = {
  user: AuthProfile
  orders: OrderRecord[]
  savedBooks: number[]
  onBack: () => void
  onSaveProfile: (profile: AuthProfile) => void
  onToggleSaved: (bookId: number) => void
  onViewOrders: () => void
  onOpenAdmin: () => void
  onSelectBook: (book: Book) => void
}

export function ProfilePage({
  user,
  orders,
  savedBooks,
  onBack,
  onSaveProfile,
  onToggleSaved,
  onViewOrders,
  onOpenAdmin,
  onSelectBook,
}: ProfilePageProps) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [saved, setSaved] = useState(false)
  const shelf = books.filter((book) => savedBooks.includes(book.id))
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSaveProfile({ name, email })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

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
          href="#profile-top"
        >
          <span className="flex size-[30px] rotate-[-7deg] items-center justify-center rounded-lg bg-lime font-display text-[19px] text-page">
            B
          </span>
          booknest
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user.role === "ADMIN" && (
            <Button
              className="hidden h-auto gap-2 rounded-full border-line bg-transparent px-3 py-2 text-xs text-ink hover:bg-surface sm:inline-flex"
              variant="outline"
              type="button"
              onClick={onOpenAdmin}
            >
              Admin dashboard <ArrowUpRight size={15} />
            </Button>
          )}
          <Button
            className="h-auto gap-2 rounded-full bg-lime px-4 py-2 text-xs text-page hover:bg-lime/90"
            type="button"
            onClick={onViewOrders}
          >
            Order history <ArrowUpRight size={15} />
          </Button>
        </div>
      </header>

      <section
        className="mx-auto max-w-[1160px] px-6 pt-16 pb-24 md:px-10 md:pt-24 md:pb-32"
        id="profile-top"
      >
        <div className="flex flex-col justify-between gap-10 border-b border-line pb-12 md:flex-row md:items-end">
          <div className="flex items-start gap-5 sm:gap-7">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-lime font-display text-4xl text-page sm:size-24 sm:text-5xl">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
                Your BookNest / 01
              </span>
              <h1 className="mt-5 font-display text-[clamp(3.5rem,7vw,6.5rem)] leading-[.85] font-normal tracking-[-.08em]">
                Hello,
                <br />
                <em className="text-lime">{name.split(" ")[0]}.</em>
              </h1>
              <p className="mt-5 flex items-center gap-2 text-sm text-muted">
                <Mail className="text-lime" size={14} /> {email}
              </p>
            </div>
          </div>
          <div className="max-w-[260px] text-sm leading-[1.65] text-muted">
            <Sparkles className="mb-4 text-lime" size={18} />
            <p className="m-0">
              A good shelf is never finished. It just gets more interesting.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 border-b border-line md:grid-cols-4">
          {[
            [
              "Books owned",
              orders
                .reduce(
                  (sum, order) =>
                    sum +
                    order.items.reduce(
                      (count, item) => count + item.quantity,
                      0
                    ),
                  0
                )
                .toString(),
              BookOpen,
            ],
            ["Saved for later", savedBooks.length.toString(), Bookmark],
            ["Orders placed", orders.length.toString(), ShoppingBag],
            ["Read in", `$${totalSpent.toFixed(0)}`, Sparkles],
          ].map(([label, value, Icon]) => (
            <div
              className="border-r border-line px-4 py-6 first:pl-0 last:border-0 md:px-6"
              key={String(label)}
            >
              <Icon className="mb-5 text-lime" size={17} />
              <strong className="block font-display text-3xl font-normal tracking-[-.06em]">
                {String(value)}
              </strong>
              <span className="mt-1 block font-mono text-[9px] tracking-[.08em] text-dim uppercase">
                {String(label)}
              </span>
            </div>
          ))}
        </div>

        <div className="grid gap-14 pt-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
          <div>
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="flex size-7 items-center justify-center rounded-full bg-lime font-mono text-xs text-page">
                02
              </span>
              <div>
                <span className="block text-sm">Profile details</span>
                <span className="block text-[11px] text-muted">
                  Keep your account up to date
                </span>
              </div>
            </div>
            <form className="mt-7 space-y-5" onSubmit={handleSave}>
              <label className="block">
                <span className="mb-2 block font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                  Full name
                </span>
                <Input
                  required
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setSaved(false)
                  }}
                  className="h-12 rounded-none border-x-0 border-t-0 border-line bg-transparent px-0 text-sm text-ink shadow-none focus-visible:border-lime focus-visible:ring-0"
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                  Email address
                </span>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setSaved(false)
                  }}
                  className="h-12 rounded-none border-x-0 border-t-0 border-line bg-transparent px-0 text-sm text-ink shadow-none focus-visible:border-lime focus-visible:ring-0"
                />
              </label>
              <Button
                className="h-11 gap-3 rounded-full bg-lime px-5 text-xs text-page hover:bg-lime/90"
                type="submit"
              >
                {saved ? "Saved" : "Save changes"}
                {saved ? <Check size={16} /> : <ArrowUpRight size={16} />}
              </Button>
            </form>
            <div className="mt-12 flex items-start gap-3 border border-line bg-surface p-4 text-xs leading-[1.6] text-muted">
              <Settings2 className="mt-0.5 shrink-0 text-lime" size={16} />
              <p className="m-0">
                Password and account security settings will be connected to the
                user service next.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-lime font-mono text-xs text-page">
                  03
                </span>
                <div>
                  <span className="block text-sm">Your saved shelf</span>
                  <span className="block text-[11px] text-muted">
                    Books you want to remember
                  </span>
                </div>
              </div>
              <span className="font-mono text-[9px] tracking-[.08em] text-dim uppercase">
                {shelf.length} saved
              </span>
            </div>
            {shelf.length === 0 ? (
              <div className="flex flex-col items-center border border-dashed border-line p-12 text-center">
                <BookOpen className="text-lime" size={22} />
                <p className="mt-4 text-sm text-muted">
                  Save a book from the catalog and it will appear here.
                </p>
                <Button
                  className="mt-4 h-auto gap-1 bg-transparent p-0 text-xs text-lime hover:bg-transparent"
                  variant="ghost"
                  type="button"
                  onClick={onViewOrders}
                >
                  View your orders <ChevronRight size={14} />
                </Button>
              </div>
            ) : (
              <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {shelf.map((book) => (
                  <article className="group" key={book.id}>
                    <button
                      className="relative block aspect-[.76] w-full overflow-hidden border-b-2 border-lime bg-surface"
                      type="button"
                      onClick={() => onSelectBook(book)}
                    >
                      <img
                        className="h-full w-full object-cover brightness-[.85] saturate-[.7] transition duration-700 ease-out group-hover:scale-[1.04] group-hover:saturate-100"
                        src={book.cover}
                        alt={`${book.title} cover artwork`}
                      />
                      <span className="absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-full bg-page/70 text-lime">
                        <ArrowUpRight size={14} />
                      </span>
                    </button>
                    <div className="flex items-start justify-between gap-2 pt-3">
                      <div className="min-w-0">
                        <Badge className="rounded-none border-0 bg-surface px-2 py-1 font-mono text-[8px] font-normal tracking-[.1em] text-muted uppercase">
                          {book.category}
                        </Badge>
                        <h2 className="mt-2 truncate font-display text-lg font-normal tracking-[-.05em]">
                          {book.title}
                        </h2>
                        <p className="mt-1 text-[10px] text-muted">
                          {book.author}
                        </p>
                      </div>
                      <Button
                        className="size-7 shrink-0 rounded-full bg-transparent p-0 text-muted hover:bg-coral/10 hover:text-coral"
                        size="icon-sm"
                        variant="ghost"
                        type="button"
                        aria-label={`Remove ${book.title} from saved books`}
                        onClick={() => onToggleSaved(book.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
