import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  MoreHorizontal,
  Search,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import type { OrderRecord } from "@/pages/OrderHistoryPage"
import { useBookStore } from "@/state/book-store"

type AdminDashboardPageProps = {
  orders: OrderRecord[]
  onBack: () => void
  onOpenStore: () => void
}

type DashboardTab = "overview" | "inventory" | "orders" | "users"

const users = [
  {
    name: "John Doe",
    email: "john@gmail.com",
    role: "CUSTOMER",
    joined: "Jul 08, 2026",
    status: "Active",
  },
  {
    name: "Jane Smith",
    email: "jane@gmail.com",
    role: "CUSTOMER",
    joined: "Jul 07, 2026",
    status: "Active",
  },
  {
    name: "System Administrator",
    email: "admin@booknest.com",
    role: "ADMIN",
    joined: "Jul 01, 2026",
    status: "Active",
  },
]

const salesBars = [48, 62, 44, 71, 56, 82, 68, 92, 65, 77, 88, 100]

export function AdminDashboardPage({
  orders,
  onBack,
  onOpenStore,
}: AdminDashboardPageProps) {
  const { books } = useBookStore()
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview")
  const [inventoryQuery, setInventoryQuery] = useState("")

  const filteredBooks = useMemo(() => {
    const query = inventoryQuery.trim().toLowerCase()
    if (!query) return books
    return books.filter((book) =>
      `${book.title} ${book.author} ${book.category}`
        .toLowerCase()
        .includes(query)
    )
  }, [inventoryQuery])

  const recentOrders =
    orders.length > 0
      ? orders
      : [
          {
            id: "BN-1024",
            date: "2026-07-09",
            total: 43.99,
            status: "Completed" as const,
            items: [{ bookId: 2, quantity: 1 }],
            paymentMethod: "Credit Card",
            transactionId: "TXN-76839210-MOCK",
          },
        ]

  const tabItems: Array<{
    id: DashboardTab
    label: string
    icon: typeof BarChart3
  }> = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "inventory", label: "Inventory", icon: Boxes },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "users", label: "Users", icon: Users },
  ]

  return (
    <main className="min-h-screen bg-page text-ink selection:bg-lime selection:text-page">
      <header className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between border-b border-line px-6 md:h-[82px] md:px-10">
        <Button
          className="gap-2 bg-transparent px-0 text-xs text-muted hover:bg-transparent hover:text-ink"
          variant="ghost"
          type="button"
          onClick={onBack}
        >
          <ArrowLeft size={16} /> Back to profile
        </Button>
        <a
          className="hidden items-center gap-2.5 text-base font-semibold tracking-[-.04em] sm:inline-flex"
          href="#admin-top"
        >
          <span className="flex size-[30px] rotate-[-7deg] items-center justify-center rounded-lg bg-lime font-display text-[19px] text-page">
            B
          </span>
          booknest{" "}
          <span className="font-mono text-[9px] font-normal tracking-[.08em] text-dim uppercase">
            / admin
          </span>
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            className="h-auto gap-2 rounded-full border-line bg-transparent px-3 py-2 text-xs text-ink hover:bg-surface"
            variant="outline"
            type="button"
            onClick={onOpenStore}
          >
            View store <ArrowUpRight size={15} />
          </Button>
        </div>
      </header>

      <section
        className="mx-auto max-w-[1280px] px-6 pt-14 pb-20 md:px-10 md:pt-20 md:pb-28"
        id="admin-top"
      >
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 font-mono text-[9px] tracking-[.12em] text-lime uppercase">
              <ShieldCheck size={14} /> Control room / 01
            </div>
            <h1 className="mt-6 font-display text-[clamp(3.6rem,7vw,6.8rem)] leading-[.84] font-normal tracking-[-.08em]">
              Good morning,
              <br />
              <em className="text-lime">admin.</em>
            </h1>
          </div>
          <div className="max-w-[250px] text-sm leading-[1.65] text-muted">
            <p className="m-0">
              The shelf is moving. Here is what needs your attention today.
            </p>
            <span className="mt-4 block font-mono text-[9px] tracking-[.08em] text-dim uppercase">
              Thursday / 10 Jul 2026
            </span>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line md:grid-cols-4">
          <div className="bg-surface p-5 md:p-6">
            <CircleDollarSign className="text-lime" size={18} />
            <span className="mt-8 block font-mono text-[9px] tracking-[.08em] text-dim uppercase">
              Gross sales
            </span>
            <strong className="mt-2 block font-display text-3xl font-normal tracking-[-.06em]">
              $8,420
            </strong>
            <span className="mt-2 flex items-center gap-1 text-[10px] text-lime">
              <TrendingUp size={12} /> 12.4% this month
            </span>
          </div>
          <div className="bg-surface p-5 md:p-6">
            <ShoppingBag className="text-lime" size={18} />
            <span className="mt-8 block font-mono text-[9px] tracking-[.08em] text-dim uppercase">
              Orders
            </span>
            <strong className="mt-2 block font-display text-3xl font-normal tracking-[-.06em]">
              248
            </strong>
            <span className="mt-2 block text-[10px] text-muted">
              18 need attention
            </span>
          </div>
          <div className="bg-surface p-5 md:p-6">
            <BookOpen className="text-lime" size={18} />
            <span className="mt-8 block font-mono text-[9px] tracking-[.08em] text-dim uppercase">
              Titles live
            </span>
            <strong className="mt-2 block font-display text-3xl font-normal tracking-[-.06em]">
              {books.length}
            </strong>
            <span className="mt-2 block text-[10px] text-muted">
              2 low stock
            </span>
          </div>
          <div className="bg-surface p-5 md:p-6">
            <Users className="text-lime" size={18} />
            <span className="mt-8 block font-mono text-[9px] tracking-[.08em] text-dim uppercase">
              Active readers
            </span>
            <strong className="mt-2 block font-display text-3xl font-normal tracking-[-.06em]">
              1,284
            </strong>
            <span className="mt-2 flex items-center gap-1 text-[10px] text-lime">
              <TrendingUp size={12} /> 8.6% this month
            </span>
          </div>
        </div>

        <div className="mt-12 flex gap-2 overflow-x-auto border-b border-line pb-3">
          {tabItems.map(({ id, label, icon: Icon }) => (
            <Button
              className={`h-auto shrink-0 gap-2 rounded-full border px-4 py-2 text-xs ${activeTab === id ? "border-lime bg-lime text-page hover:bg-lime" : "border-line bg-transparent text-muted hover:bg-surface hover:text-ink"}`}
              variant="outline"
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={14} /> {label}
            </Button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
            <section className="border border-line bg-surface p-5 md:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                    Sales activity
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-normal tracking-[-.06em]">
                    A steady climb.
                  </h2>
                </div>
                <Badge className="rounded-full border-0 bg-lime/10 px-2.5 py-1 font-mono text-[8px] font-normal tracking-[.1em] text-lime uppercase">
                  Last 12 months
                </Badge>
              </div>
              <div className="mt-12 flex h-48 items-end gap-2 border-b border-line pb-0 sm:gap-4">
                {salesBars.map((height, index) => (
                  <div
                    className="group flex flex-1 flex-col items-center gap-2"
                    key={index}
                  >
                    <div
                      className={`w-full max-w-10 rounded-t-sm transition-colors group-hover:bg-lime ${index === salesBars.length - 1 ? "bg-lime" : "bg-ink/15"}`}
                      style={{ height: `${height}%` }}
                    />
                    <span className="font-mono text-[8px] text-dim">
                      {
                        [
                          "J",
                          "F",
                          "M",
                          "A",
                          "M",
                          "J",
                          "J",
                          "A",
                          "S",
                          "O",
                          "N",
                          "D",
                        ][index]
                      }
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <section className="border border-line bg-lime p-5 text-page md:p-7">
              <span className="font-mono text-[9px] tracking-[.1em] uppercase opacity-60">
                Quick actions
              </span>
              <h2 className="mt-3 font-display text-3xl leading-[.9] font-normal tracking-[-.06em]">
                Keep the
                <br />
                shelf healthy.
              </h2>
              <div className="mt-10 space-y-3">
                <button
                  className="flex w-full items-center justify-between border-b border-page/20 pb-3 text-left text-xs"
                  type="button"
                  onClick={() => setActiveTab("inventory")}
                >
                  <span>Review low stock</span>
                  <ChevronRight size={16} />
                </button>
                <button
                  className="flex w-full items-center justify-between border-b border-page/20 pb-3 text-left text-xs"
                  type="button"
                  onClick={() => setActiveTab("orders")}
                >
                  <span>Review pending orders</span>
                  <ChevronRight size={16} />
                </button>
                <button
                  className="flex w-full items-center justify-between border-b border-page/20 pb-3 text-left text-xs"
                  type="button"
                  onClick={() => setActiveTab("users")}
                >
                  <span>View reader list</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </section>
            <section className="border border-line bg-surface p-5 md:col-span-2 md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                    Recent orders
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-normal tracking-[-.06em]">
                    The latest movement.
                  </h2>
                </div>
                <Button
                  className="h-auto gap-1 bg-transparent px-0 text-xs text-muted hover:bg-transparent hover:text-ink"
                  variant="ghost"
                  type="button"
                  onClick={() => setActiveTab("orders")}
                >
                  View all <ArrowUpRight size={14} />
                </Button>
              </div>
              <div className="mt-7 divide-y divide-line">
                {recentOrders.slice(0, 3).map((order) => (
                  <div
                    className="flex flex-col justify-between gap-3 py-4 first:pt-0 sm:flex-row sm:items-center"
                    key={order.id}
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex size-9 items-center justify-center rounded-full bg-page font-mono text-[9px] text-lime">
                        {order.id.slice(-2)}
                      </span>
                      <div>
                        <strong className="block text-xs font-medium">
                          {order.id}
                        </strong>
                        <span className="mt-1 block text-[10px] text-muted">
                          {order.date} · {order.items.length} line items
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <Badge className="rounded-full border-0 bg-lime/10 px-2.5 py-1 font-mono text-[8px] font-normal tracking-[.1em] text-lime uppercase">
                        {order.status}
                      </Badge>
                      <strong className="text-sm font-medium">
                        ${order.total.toFixed(2)}
                      </strong>
                      <MoreHorizontal className="text-dim" size={17} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "inventory" && (
          <section className="mt-10 border border-line bg-surface p-5 md:p-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <span className="font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                  Catalog management
                </span>
                <h2 className="mt-3 font-display text-3xl font-normal tracking-[-.06em]">
                  The inventory.
                </h2>
              </div>
              <Button
                className="h-auto gap-2 rounded-full bg-lime px-4 py-2 text-xs text-page hover:bg-lime/90"
                type="button"
              >
                <BookOpen size={14} /> Add a book
              </Button>
            </div>
            <div className="relative mt-8 max-w-[370px]">
              <Search
                className="absolute top-1/2 left-4 -translate-y-1/2 text-lime"
                size={16}
              />
              <Input
                value={inventoryQuery}
                onChange={(event) => setInventoryQuery(event.target.value)}
                placeholder="Search inventory"
                className="h-11 rounded-full border-line bg-page pl-11 text-sm text-ink placeholder:text-dim focus-visible:border-lime focus-visible:ring-1 focus-visible:ring-lime/30"
              />
            </div>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="border-b border-line font-mono text-[9px] tracking-[.08em] text-dim uppercase">
                  <tr>
                    <th className="pb-4 font-normal">Book</th>
                    <th className="pb-4 font-normal">Category</th>
                    <th className="pb-4 font-normal">Price</th>
                    <th className="pb-4 font-normal">Stock</th>
                    <th className="pb-4 font-normal">Status</th>
                    <th className="pb-4 text-right font-normal">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredBooks.map((book) => (
                    <tr key={book.id}>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <img
                            className="size-10 object-cover"
                            src={book.cover}
                            alt={`${book.title} cover artwork`}
                          />
                          <div>
                            <strong className="block font-medium">
                              {book.title}
                            </strong>
                            <span className="mt-1 block text-[10px] text-muted">
                              {book.author}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-muted">{book.category}</td>
                      <td className="py-4">${book.price.toFixed(2)}</td>
                      <td className="py-4 font-mono">{book.stock}</td>
                      <td className="py-4">
                        <Badge
                          className={`rounded-full border-0 px-2.5 py-1 font-mono text-[8px] font-normal tracking-[.08em] uppercase ${book.stock < 50 ? "bg-coral/10 text-coral" : "bg-lime/10 text-lime"}`}
                        >
                          {book.stock < 50 ? "Low stock" : "Healthy"}
                        </Badge>
                      </td>
                      <td className="py-4 text-right">
                        <Button
                          className="h-auto bg-transparent px-0 text-xs text-muted hover:bg-transparent hover:text-ink"
                          variant="ghost"
                          type="button"
                        >
                          Edit <ArrowUpRight size={13} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "orders" && (
          <section className="mt-10 border border-line bg-surface p-5 md:p-7">
            <div>
              <span className="font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                Order operations
              </span>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-.06em]">
                Every order, accounted for.
              </h2>
            </div>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="border-b border-line font-mono text-[9px] tracking-[.08em] text-dim uppercase">
                  <tr>
                    <th className="pb-4 font-normal">Order</th>
                    <th className="pb-4 font-normal">Date</th>
                    <th className="pb-4 font-normal">Payment</th>
                    <th className="pb-4 font-normal">Total</th>
                    <th className="pb-4 font-normal">Status</th>
                    <th className="pb-4 text-right font-normal">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-5 font-medium">{order.id}</td>
                      <td className="py-5 text-muted">{order.date}</td>
                      <td className="py-5 text-muted">{order.paymentMethod}</td>
                      <td className="py-5 font-medium">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="py-5">
                        <Badge className="rounded-full border-0 bg-lime/10 px-2.5 py-1 font-mono text-[8px] font-normal tracking-[.08em] text-lime uppercase">
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-5 text-right">
                        <Button
                          className="h-auto bg-transparent px-0 text-xs text-muted hover:bg-transparent hover:text-ink"
                          variant="ghost"
                          type="button"
                        >
                          Details <ChevronRight size={13} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "users" && (
          <section className="mt-10 border border-line bg-surface p-5 md:p-7">
            <div className="flex items-end justify-between">
              <div>
                <span className="font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                  Reader directory
                </span>
                <h2 className="mt-3 font-display text-3xl font-normal tracking-[-.06em]">
                  The people behind the reads.
                </h2>
              </div>
              <span className="font-mono text-[9px] tracking-[.08em] text-dim uppercase">
                {users.length} accounts
              </span>
            </div>
            <div className="mt-8 divide-y divide-line">
              {users.map((reader) => (
                <div
                  className="flex flex-col justify-between gap-4 py-5 first:pt-0 sm:flex-row sm:items-center"
                  key={reader.email}
                >
                  <div className="flex items-center gap-4">
                    <span className="flex size-10 items-center justify-center rounded-full bg-lime font-display text-lg text-page">
                      {reader.name.charAt(0)}
                    </span>
                    <div>
                      <strong className="block text-xs font-medium">
                        {reader.name}
                      </strong>
                      <span className="mt-1 block text-[10px] text-muted">
                        {reader.email} · Joined {reader.joined}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:pr-2">
                    <Badge
                      className={`rounded-full border-0 px-2.5 py-1 font-mono text-[8px] font-normal tracking-[.08em] uppercase ${reader.role === "ADMIN" ? "bg-coral/10 text-coral" : "bg-lime/10 text-lime"}`}
                    >
                      {reader.role}
                    </Badge>
                    <span className="flex items-center gap-1 text-[10px] text-muted">
                      <span className="size-1.5 rounded-full bg-lime" />{" "}
                      {reader.status}
                    </span>
                    <MoreHorizontal className="text-dim" size={17} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}
