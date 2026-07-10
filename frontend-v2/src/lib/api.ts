import type { Book } from "@/data/books"

const apiBase = (name: string, fallback: string) => {
  const value = import.meta.env[name] as string | undefined
  return value?.replace(/\/$/, "") ?? fallback
}

export const apiUrls = {
  books: apiBase("VITE_BOOK_API_URL", "http://localhost:8081"),
  cart: apiBase("VITE_CART_API_URL", "http://localhost:8082"),
  orders: apiBase("VITE_ORDER_API_URL", "http://localhost:8083"),
  payments: apiBase("VITE_PAYMENT_API_URL", "http://localhost:8084"),
  users: apiBase("VITE_USER_API_URL", "http://localhost:8085"),
}

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export type ApiBook = {
  id: number
  title: string
  author: string
  isbn?: string
  price: number
  stock: number
  coverUrl?: string
  description?: string
  category?: { id: number; name: string } | null
}

export function mapApiBook(book: ApiBook): Book {
  const accents: Book["accent"][] = ["lime", "blue", "orange", "violet"]

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    category: book.category?.name ?? "Uncategorized",
    categoryId: book.category?.id,
    isbn: book.isbn,
    price: Number(book.price),
    rating: "4.8",
    format: "Digital edition",
    stock: book.stock,
    description: book.description ?? "A thoughtful addition to your reading shelf.",
    cover: book.coverUrl ?? "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=900&q=85",
    accent: accents[(book.id - 1) % accents.length],
  }
}

export type BookWritePayload = {
  id?: number
  title: string
  author: string
  isbn?: string
  price: number
  stock: number
  coverUrl?: string
  description?: string
  category: { id: number; name: string }
}

export async function createBook(payload: BookWritePayload) {
  return mapApiBook(await request<ApiBook>(apiUrls.books, "/api/books", { method: "POST", body: JSON.stringify(payload) }))
}

export async function updateBook(payload: BookWritePayload) {
  return mapApiBook(await request<ApiBook>(apiUrls.books, "/api/books", { method: "PUT", body: JSON.stringify(payload) }))
}

export async function deleteBook(bookId: number) {
  return request<void>(apiUrls.books, `/api/books/${bookId}`, { method: "DELETE" })
}

export async function fetchBooks() {
  const response = await request<ApiBook[]>(apiUrls.books, "/api/books")
  return response.map(mapApiBook)
}

export async function fetchBook(bookId: number) {
  return mapApiBook(await request<ApiBook>(apiUrls.books, `/api/books/${bookId}`))
}

export type ApiUser = {
  id: number
  name: string
  email: string
  role: "CUSTOMER" | "ADMIN"
}

export type LoginRequest = { email: string; password: string }
export type RegisterRequest = { name: string; email: string; password: string; role: "CUSTOMER" | "ADMIN" }

export async function loginUser(payload: LoginRequest) {
  return request<ApiUser>(apiUrls.users, "/api/users/login", { method: "POST", body: JSON.stringify(payload) })
}

export async function registerUser(payload: RegisterRequest) {
  return request<ApiUser>(apiUrls.users, "/api/users", { method: "POST", body: JSON.stringify(payload) })
}

export async function updateUser(payload: ApiUser) {
  return request<ApiUser>(apiUrls.users, "/api/users", { method: "PUT", body: JSON.stringify(payload) })
}

export type ApiCartItem = { id: number; userId: number; bookId: number; quantity: number }

export async function fetchCart(userId: number) {
  return request<ApiCartItem[]>(apiUrls.cart, `/api/cart?userId=${userId}`)
}

export async function createCartItem(payload: Omit<ApiCartItem, "id">) {
  return request<ApiCartItem>(apiUrls.cart, "/api/cart", { method: "POST", body: JSON.stringify(payload) })
}

export async function updateCartItem(payload: ApiCartItem) {
  return request<ApiCartItem>(apiUrls.cart, "/api/cart", { method: "PUT", body: JSON.stringify(payload) })
}

export async function deleteCartItem(id: number) {
  return request<void>(apiUrls.cart, `/api/cart/${id}`, { method: "DELETE" })
}

export type ApiOrderItem = { id?: number; bookId: number; quantity: number; price: number }
export type ApiOrder = { id: number; userId: number; totalAmount: number; status: string; orderDate: string; orderItems?: ApiOrderItem[] }

export async function fetchOrders(userId: number) {
  return request<ApiOrder[]>(apiUrls.orders, `/api/orders?userId=${userId}`)
}

export async function createOrder(payload: Omit<ApiOrder, "id">) {
  return request<ApiOrder>(apiUrls.orders, "/api/orders", { method: "POST", body: JSON.stringify(payload) })
}

export type ApiPayment = { id?: number; orderId: number; userId: number; amount: number; paymentMethod: string; status: string; transactionId: string; paymentDate: string }

export async function createPayment(payload: Omit<ApiPayment, "id">) {
  return request<ApiPayment>(apiUrls.payments, "/api/payments", { method: "POST", body: JSON.stringify(payload) })
}
