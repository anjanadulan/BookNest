import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "./index.css"
import App from "./App.tsx"
import { RevealProvider } from "@/components/reveal-provider"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { BookStoreProvider } from "@/state/book-store"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark">
        <BookStoreProvider>
          <RevealProvider />
          <App />
        </BookStoreProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
