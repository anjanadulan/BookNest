import { useState } from "react"
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CreditCard,
  Lock,
  ShieldCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { books } from "@/data/books"
import { ThemeToggle } from "@/components/theme-toggle"
import type { CartLine } from "@/pages/CartPage"
import type { CheckoutDetails } from "@/pages/CheckoutPage"

export type PaymentResult = {
  paymentMethod: string
  lastFour: string
}

type PaymentPageProps = {
  cartItems: CartLine[]
  details: CheckoutDetails
  onBack: () => void
  onComplete: (payment: PaymentResult) => void
}

export function PaymentPage({
  cartItems,
  details,
  onBack,
  onComplete,
}: PaymentPageProps) {
  const [cardName, setCardName] = useState(details.name)
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
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
    onComplete({
      paymentMethod: "CREDIT_CARD",
      lastFour: cardNumber.replace(/\s/g, "").slice(-4),
    })
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
          <ArrowLeft size={16} /> Back to checkout
        </Button>
        <a
          className="hidden items-center gap-2.5 text-base font-semibold tracking-[-.04em] sm:inline-flex"
          href="#payment-top"
        >
          <span className="flex size-[30px] rotate-[-7deg] items-center justify-center rounded-lg bg-lime font-display text-[19px] text-page">
            B
          </span>
          booknest
        </a>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="flex items-center gap-2 font-mono text-[10px] tracking-[.08em] text-muted uppercase">
            <Lock className="text-lime" size={14} /> Encrypted payment
          </span>
        </div>
      </header>

      <section
        className="mx-auto max-w-[1160px] px-6 pt-16 pb-24 md:px-10 md:pt-24 md:pb-32"
        id="payment-top"
      >
        <div className="mb-12">
          <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
            02 / Payment
          </span>
          <h1 className="mt-6 font-display text-[clamp(3.7rem,8vw,7.2rem)] leading-[.85] font-normal tracking-[-.08em]">
            Make it
            <br />
            <em className="text-lime">yours.</em>
          </h1>
          <p className="mt-6 max-w-[360px] text-sm leading-[1.65] text-muted">
            One last step. Your reading list is about to become your shelf.
          </p>
        </div>
        <div className="grid gap-14 lg:grid-cols-[1.1fr_.9fr] lg:gap-24">
          <form className="max-w-[600px]" onSubmit={handleSubmit}>
            <div className="mb-8 flex items-center gap-3 border-b border-line pb-4">
              <span className="flex size-7 items-center justify-center rounded-full bg-lime font-mono text-xs text-page">
                2
              </span>
              <div>
                <span className="block text-sm">Payment details</span>
                <span className="block text-[11px] text-muted">
                  A secure, simulated card payment
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-line bg-surface p-5 md:p-7">
              <div className="mb-7 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <CreditCard className="text-lime" size={18} /> Credit card
                </span>
                <Badge className="rounded-full border-0 bg-lime/10 px-2 py-1 font-mono text-[8px] font-normal tracking-[.1em] text-lime uppercase">
                  Mock secure
                </Badge>
              </div>
              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                    Name on card
                  </span>
                  <Input
                    required
                    value={cardName}
                    onChange={(event) => setCardName(event.target.value)}
                    placeholder="Alex Reader"
                    className="h-11 border-line bg-page/50 text-sm text-ink placeholder:text-dim focus-visible:border-lime focus-visible:ring-1 focus-visible:ring-lime/30"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                    Card number
                  </span>
                  <Input
                    required
                    minLength={12}
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="h-11 border-line bg-page/50 font-mono text-sm text-ink placeholder:text-dim focus-visible:border-lime focus-visible:ring-1 focus-visible:ring-lime/30"
                  />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-2 block font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                      Expiry
                    </span>
                    <Input
                      required
                      value={expiry}
                      onChange={(event) => setExpiry(event.target.value)}
                      placeholder="MM / YY"
                      className="h-11 border-line bg-page/50 font-mono text-sm text-ink placeholder:text-dim focus-visible:border-lime focus-visible:ring-1 focus-visible:ring-lime/30"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                      CVC
                    </span>
                    <Input
                      required
                      minLength={3}
                      maxLength={4}
                      inputMode="numeric"
                      value={cvc}
                      onChange={(event) => setCvc(event.target.value)}
                      placeholder="123"
                      className="h-11 border-line bg-page/50 font-mono text-sm text-ink placeholder:text-dim focus-visible:border-lime focus-visible:ring-1 focus-visible:ring-lime/30"
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3 text-[11px] leading-[1.5] text-muted">
              <ShieldCheck className="mt-0.5 shrink-0 text-lime" size={16} />{" "}
              This is a frontend demo payment. No real card details are sent or
              stored.
            </div>
            <Button
              className="mt-8 h-12 w-full justify-between rounded-full bg-lime px-5 text-xs text-page hover:bg-lime/90 sm:w-[260px]"
              type="submit"
            >
              Pay ${total.toFixed(2)} <ArrowUpRight size={17} />
            </Button>
          </form>

          <aside className="h-fit bg-surface p-6 md:p-8 lg:sticky lg:top-8">
            <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
              Order preview
            </span>
            <div className="mt-7 divide-y divide-line">
              {lines.map((line) => (
                <div
                  className="flex items-center justify-between gap-4 py-4 first:pt-0"
                  key={line.bookId}
                >
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-normal tracking-[-.05em]">
                      {line.book?.title}
                    </h2>
                    <p className="mt-1 text-[10px] text-muted">
                      {line.quantity} × ${line.book?.price.toFixed(2)}
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
                Due now
              </span>
              <strong className="text-2xl font-medium tracking-[-.05em]">
                ${total.toFixed(2)}
              </strong>
            </div>
            <div className="mt-7 flex items-start gap-2 text-[10px] leading-[1.5] text-dim">
              <Check className="mt-0.5 text-lime" size={14} /> Receipt will be
              sent to {details.email}
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
