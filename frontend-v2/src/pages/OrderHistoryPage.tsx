import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Clock3,
  ShoppingBag,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { books } from "@/data/books"
import { ThemeToggle } from "@/components/theme-toggle"
import type { CartLine } from "@/pages/CartPage"

export type OrderRecord = {
  id: string
  date: string
  total: number
  status: "Completed" | "Processing"
  items: CartLine[]
  paymentMethod: string
  transactionId: string
}

type OrderHistoryPageProps = {
  orders: OrderRecord[]
  onBack: () => void
  onContinueShopping: () => void
}

export function OrderHistoryPage({
  orders,
  onBack,
  onContinueShopping,
}: OrderHistoryPageProps) {
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
          href="#orders-top"
        >
          <span className="flex size-[30px] rotate-[-7deg] items-center justify-center rounded-lg bg-lime font-display text-[19px] text-page">
            B
          </span>
          booknest
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            className="h-auto gap-2 rounded-full bg-lime px-4 py-2 text-xs text-page hover:bg-lime/90"
            type="button"
            onClick={onContinueShopping}
          >
            Keep browsing <ArrowUpRight size={15} />
          </Button>
        </div>
      </header>

      <section
        className="mx-auto max-w-[1160px] px-6 pt-16 pb-24 md:px-10 md:pt-24 md:pb-32"
        id="orders-top"
      >
        <div className="flex flex-col justify-between gap-8 border-b border-line pb-12 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
              01 / Your reading life
            </span>
            <h1 className="mt-6 font-display text-[clamp(3.7rem,8vw,7.2rem)] leading-[.85] font-normal tracking-[-.08em]">
              Order
              <br />
              <em className="text-lime">history.</em>
            </h1>
          </div>
          <div className="max-w-[270px] text-sm leading-[1.65] text-muted">
            <ShoppingBag className="mb-4 text-lime" size={18} />
            <p className="m-0">
              Every good book is a small beginning. Here are yours so far.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="mx-auto flex max-w-[500px] flex-col items-center py-28 text-center">
            <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-surface text-lime">
              <Clock3 size={25} />
            </div>
            <h2 className="font-display text-3xl font-normal tracking-[-.06em]">
              No orders yet.
            </h2>
            <p className="mt-3 text-sm leading-[1.6] text-muted">
              Your first good read is waiting on the shelf.
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
          <div className="pt-12">
            <div className="mb-5 flex items-center justify-between font-mono text-[9px] tracking-[.08em] text-dim uppercase">
              <span>
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </span>
              <span>Digital editions</span>
            </div>
            <div className="space-y-5">
              {orders.map((order) => {
                const orderBooks = order.items
                  .map((item) => books.find((book) => book.id === item.bookId))
                  .filter(Boolean)
                return (
                  <article
                    className="border border-line bg-surface p-5 md:p-7"
                    key={order.id}
                  >
                    <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <Badge className="rounded-full border-0 bg-lime/10 px-2.5 py-1 font-mono text-[8px] font-normal tracking-[.1em] text-lime uppercase">
                            <Check className="mr-1 inline" size={11} />{" "}
                            {order.status}
                          </Badge>
                          <span className="font-mono text-[9px] tracking-[.08em] text-dim uppercase">
                            {order.id}
                          </span>
                        </div>
                        <p className="mt-3 text-xs text-muted">
                          Placed {order.date} · Paid with {order.paymentMethod}
                        </p>
                      </div>
                      <strong className="text-xl font-medium tracking-[-.05em]">
                        ${order.total.toFixed(2)}
                      </strong>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-5 pt-5">
                      <div className="flex -space-x-3">
                        {orderBooks.map(
                          (book) =>
                            book && (
                              <div
                                className="size-12 overflow-hidden rounded-full border-2 border-surface bg-page"
                                key={book.id}
                              >
                                <img
                                  className="h-full w-full object-cover"
                                  src={book.cover}
                                  alt={`${book.title} cover artwork`}
                                />
                              </div>
                            )
                        )}
                        <div className="flex size-12 items-center justify-center rounded-full border-2 border-surface bg-page font-mono text-[10px] text-muted">
                          {order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}
                          x
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="m-0 text-xs text-ink">
                          {orderBooks
                            .slice(0, 2)
                            .map((book) => book?.title)
                            .join(" · ")}
                          {orderBooks.length > 2 ? " · More" : ""}
                        </p>
                        <p className="mt-2 font-mono text-[9px] tracking-[.08em] text-dim uppercase">
                          Transaction {order.transactionId}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
