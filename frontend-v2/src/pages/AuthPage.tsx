import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { loginUser, registerUser } from "@/lib/api"

export type AuthProfile = {
  id?: number
  name: string
  email: string
  role?: "CUSTOMER" | "ADMIN"
}

type AuthPageProps = {
  onBack: () => void
  onSuccess: (profile: AuthProfile) => void | Promise<void>
}

export function AuthPage({ onBack, onSuccess }: AuthPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const mode = location.pathname === "/register" ? "register" : "login"
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response =
        mode === "login"
          ? await loginUser({ email, password })
          : await registerUser({
              name,
              email,
              password,
              role:
                email.toLowerCase() === "admin@booknest.com"
                  ? "ADMIN"
                  : "CUSTOMER",
            })
      await onSuccess({
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
      })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to connect to the user service"
      )
    } finally {
      setIsSubmitting(false)
    }
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
          <ArrowLeft size={16} /> Back
        </Button>
        <a
          className="inline-flex items-center gap-2.5 text-base font-semibold tracking-[-.04em]"
          href="#auth-top"
        >
          <span className="flex size-[30px] rotate-[-7deg] items-center justify-center rounded-lg bg-lime font-display text-[19px] text-page">
            B
          </span>
          booknest
        </a>
        <ThemeToggle />
      </header>

      <section
        className="mx-auto grid min-h-[calc(100vh-70px)] max-w-[1160px] gap-10 px-6 py-12 md:grid-cols-[.9fr_1fr] md:items-center md:gap-[9vw] md:px-10 md:py-20"
        id="auth-top"
      >
        <div className="relative hidden min-h-[570px] overflow-hidden bg-surface p-10 md:flex md:flex-col md:justify-between">
          <div className="absolute -top-24 -right-20 size-72 rounded-full bg-lime/10 blur-3xl" />
          <div className="relative">
            <span className="font-mono text-[9px] tracking-[.12em] text-lime uppercase">
              A quiet corner for readers
            </span>
            <h1 className="mt-7 max-w-[430px] font-display text-[clamp(3.6rem,5vw,5.7rem)] leading-[.88] font-normal tracking-[-.08em]">
              Your shelf,
              <br />
              <em className="text-lime">your pace.</em>
            </h1>
          </div>
          <div className="relative max-w-[330px]">
            <Sparkles className="mb-5 text-lime" size={20} />
            <p className="font-display text-2xl leading-[1.05] tracking-[-.05em]">
              “The best reading life is the one that leaves room for surprise.”
            </p>
            <span className="mt-5 block font-mono text-[9px] tracking-[.12em] text-dim uppercase">
              The BookNest note / 01
            </span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[430px]">
          <span className="font-mono text-[9px] tracking-[.12em] text-dim uppercase">
            {mode === "login" ? "Welcome back" : "Start your shelf"}
          </span>
          <h2 className="mt-5 font-display text-[clamp(3.1rem,6vw,5rem)] leading-[.88] font-normal tracking-[-.08em]">
            {mode === "login" ? "Good to see" : "Make room"}
            <br />
            <em className="text-lime">you again.</em>
          </h2>
          <p className="mt-6 text-sm leading-[1.65] text-muted">
            {mode === "login"
              ? "Pick up exactly where your curiosity left off."
              : "Create a free account and start building a shelf worth returning to."}
          </p>

          <div className="mt-9 grid grid-cols-2 border-b border-line">
            <Button
              className={`h-auto rounded-none border-b-2 px-0 py-3 text-xs ${mode === "login" ? "border-lime text-ink" : "border-transparent bg-transparent text-dim hover:bg-transparent hover:text-ink"}`}
              variant="ghost"
              type="button"
              onClick={() => navigate("/login", { state: location.state })}
            >
              Sign in
            </Button>
            <Button
              className={`h-auto rounded-none border-b-2 px-0 py-3 text-xs ${mode === "register" ? "border-lime text-ink" : "border-transparent bg-transparent text-dim hover:bg-transparent hover:text-ink"}`}
              variant="ghost"
              type="button"
              onClick={() => navigate("/register", { state: location.state })}
            >
              Create account
            </Button>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {mode === "register" && (
              <label className="block">
                <span className="mb-2 block font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                  Your name
                </span>
                <Input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Alex Reader"
                  className="h-12 rounded-none border-x-0 border-t-0 border-line bg-transparent px-0 text-sm text-ink shadow-none placeholder:text-dim focus-visible:border-lime focus-visible:ring-0"
                />
              </label>
            )}
            <label className="block">
              <span className="mb-2 block font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                Email address
              </span>
              <Input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 rounded-none border-x-0 border-t-0 border-line bg-transparent px-0 text-sm text-ink shadow-none placeholder:text-dim focus-visible:border-lime focus-visible:ring-0"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-mono text-[9px] tracking-[.1em] text-dim uppercase">
                Password
              </span>
              <div className="relative">
                <Input
                  required
                  minLength={6}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Six characters or more"
                  className="h-12 rounded-none border-x-0 border-t-0 border-line bg-transparent px-0 pr-10 text-sm text-ink shadow-none placeholder:text-dim focus-visible:border-lime focus-visible:ring-0"
                />
                <Button
                  className="absolute top-1/2 right-0 size-8 -translate-y-1/2 bg-transparent p-0 text-dim hover:bg-transparent hover:text-ink"
                  size="icon-sm"
                  variant="ghost"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </label>
            {mode === "login" && (
              <div className="flex items-center justify-between text-[11px] text-muted">
                <label className="flex items-center gap-2">
                  <input className="accent-lime" type="checkbox" /> Remember me
                </label>
                <button className="text-lime hover:underline" type="button">
                  Forgot password?
                </button>
              </div>
            )}
            {error && (
              <p className="border border-coral/30 bg-coral/10 p-3 text-xs leading-[1.5] text-coral">
                {error}
              </p>
            )}
            <Button
              className="mt-3 h-12 w-full justify-between rounded-full bg-lime px-5 text-xs text-page hover:bg-lime/90"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? "Connecting..."
                : mode === "login"
                  ? "Sign in to BookNest"
                  : "Create my account"}
              <ArrowUpRight size={17} />
            </Button>
          </form>
          <div className="mt-8 flex items-center gap-2 text-[10px] text-dim">
            <Check className="text-lime" size={14} /> Your reading list stays
            yours.
          </div>
        </div>
      </section>
    </main>
  )
}
