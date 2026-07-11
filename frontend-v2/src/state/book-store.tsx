import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { books as fallbackBooks, type Book } from "@/data/books"
import { fetchBooks } from "@/lib/api"

type BookStore = {
  books: Book[]
  isLoading: boolean
  error: string | null
  refreshBooks: () => Promise<void>
}

const BookStoreContext = createContext<BookStore | null>(null)

export function BookStoreProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState(fallbackBooks)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refreshBooks() {
    setIsLoading(true)
    try {
      const remoteBooks = await fetchBooks()
      if (remoteBooks.length > 0) setBooks(remoteBooks)
      setError(null)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Book service unavailable"
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshBooks(), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const value = useMemo(
    () => ({ books, isLoading, error, refreshBooks }),
    [books, isLoading, error]
  )

  return (
    <BookStoreContext.Provider value={value}>
      {children}
    </BookStoreContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBookStore() {
  const context = useContext(BookStoreContext)
  if (!context)
    throw new Error("useBookStore must be used within BookStoreProvider")
  return context
}
