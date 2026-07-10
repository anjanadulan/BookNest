import { useState } from "react"
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Lock,
  Mail,
  ShoppingBag,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { useBookStore } from "@/state/book-store"
import type { AuthProfile } from "@/pages/AuthPage"
import type { CartLine } from "@/pages/CartPage"

export type CheckoutDetails = {
  name: string
  email: string
}

type CheckoutPageProps = {
  cartItems: CartLine[]
  user: AuthProfile
  onBack: () => void
  onContinueToPayment: (details: CheckoutDetails) => void
}

export function CheckoutPage({
  cartItems,
  user,
  onBack,
  onContinueToPayment,
}: CheckoutPageProps) {
  const { books } = useBookStore()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const lines = cartItems
    .map((line) => ({
      ...line,
      book: books.find((book) => book.id === line.bookId),
    }))
    .filter((line) => line.book)
  const total = lines.reduce(
    (sum, line) => sum + (line.book?.price ?? 0) * line.quantity,
    0
  )

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onContinueToPayment({ name, email })
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
          <ArrowLeft size={16} /> Back to cart
        </Button>
        <a
          className="hidden items-center gap-2.5 text-base font-semibold tracking-[-.04em] sm:inline-flex"
          href="#checkout-top"
        >
          <span className="flex size-[30px] rotate-[-7deg] items-center justify-center rounded-lg bg-lime font-display text-[19px] text-page">
            B
          </span>
          booknest
        </a>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="flex items-center gap-2 font-mono text-[10px] tracking-[.08em] text-muted uppercase">
            <Lock className="text-lime" size={14} /> Secure checkout
          </span>
        </div>
      </header>

      <section
        className="mx-auto max-w-[1160px] px-6 pt-16 pb-24 md:px-10 md:pt-24 md:pb-32"
        id="checkout-top"
      >
        <div className="mb-12">
          <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
            01 / Checkout
          </span>
          <h1 className="mt-6 font-display text-[clamp(3.7rem,8vw,7.2rem)] leading-[.85] font-normal tracking-[-.08em]">
            Almost
            <br />
            <em className="text-lime">yours.</em>
          </h1>
          <p className="mt-6 max-w-[350px] text-sm leading-[1.65] text-muted">
            Confirm where we should send your receipt, then we will get your
            shelf ready.
          </p>
        </div>

        <div className="grid gap-14 lg:grid-cols-[1.1fr_.9fr] lg:gap-24">
          <form className="max-w-[600px]" onSubmit={handleSubmit}>
            <div className="mb-8 flex items-center gap-3 border-b border-line pb-4">
              <span className="flex size-7 items-center justify-center rounded-full bg-lime font-mono text-xs text-page">
                1
              </span>
              <div>
                <span className="block text-sm">Your details</span>
                <span className="block text-[11px] text-muted">
                  For your order receipt
                </span>
              </div>
            </div>
            <div className="space-y-6">
              <label className="block">
                <span className="mb-2 block font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                  Full name
                </span>
                <Input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Alex Reader"
                  className="h-12 rounded-none border-x-0 border-t-0 border-line bg-transparent px-0 text-sm text-ink shadow-none placeholder:text-dim focus-visible:border-lime focus-visible:ring-0"
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                  Email for receipt
                </span>
                <div className="relative">
                  <Mail
                    className="absolute top-1/2 left-0 -translate-y-1/2 text-lime"
                    size={15}
                  />
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-12 rounded-none border-x-0 border-t-0 border-line bg-transparent pl-7 text-sm text-ink shadow-none placeholder:text-dim focus-visible:border-lime focus-visible:ring-0"
                  />
                </div>
              </label>
            </div>
            <div className="mt-10 flex items-start gap-3 border border-line bg-surface p-4 text-xs text-muted">
              <Check className="mt-0.5 shrink-0 text-lime" size={16} />
              <p className="m-0 leading-[1.6]">
                Your digital books will be available instantly after payment. No
                shipping, no waiting.
              </p>
            </div>
            <Button
              className="mt-8 h-12 w-full justify-between rounded-full bg-lime px-5 text-xs text-page hover:bg-lime/90 sm:w-[260px]"
              type="submit"
            >
              Continue to payment <ArrowUpRight size={17} />
            </Button>
          </form>

          <aside className="h-fit bg-surface p-6 md:p-8">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
                02 / Your order
              </span>
              <ShoppingBag className="text-lime" size={18} />
            </div>
            <div className="mt-7 divide-y divide-line">
              {lines.map((line) => (
                <div className="flex gap-4 py-4 first:pt-0" key={line.bookId}>
                  <div className="size-14 shrink-0 overflow-hidden bg-page">
                    <img
                      className="h-full w-full object-cover"
                      src={line.book?.cover}
                      alt={`${line.book?.title} cover artwork`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Badge className="rounded-none border-0 bg-page px-2 py-1 font-mono text-[8px] font-normal tracking-[.1em] text-muted uppercase">
                      {line.book?.category}
                    </Badge>
                    <h2 className="mt-2 truncate font-display text-lg font-normal tracking-[-.05em]">
                      {line.book?.title}
                    </h2>
                    <p className="mt-1 text-[10px] text-muted">
                      Qty {line.quantity}
                    </p>
                  </div>
                  <strong className="text-xs font-medium">
                    ${((line.book?.price ?? 0) * line.quantity).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-between border-t border-line pt-5">
              <span className="font-mono text-[10px] tracking-[.08em] text-dim uppercase">
                Total today
              </span>
              <strong className="text-xl font-medium tracking-[-.05em]">
                ${total.toFixed(2)}
              </strong>
            </div>
            <p className="mt-4 text-[10px] leading-[1.5] text-dim">
              Signed in as {user.email}
            </p>
          </aside>
        </div>
      </section>
    </main>
  )
}
