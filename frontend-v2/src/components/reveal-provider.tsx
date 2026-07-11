import { useEffect } from "react"
import { useLocation } from "react-router-dom"

const TEXT_SELECTOR =
  "main :where(h1, h2, h3, h4, h5, p, li, label, blockquote, figcaption):not([data-reveal-skip])"

const ELEMENT_SELECTOR =
  "main :where(header, section, article, form, aside, footer, button, a, img, input, textarea, select, table, [role='button'], [data-reveal]):not([data-reveal-skip])"

const MINIMUM_TEXT_LENGTH = 2

function hasVisibleText(element: Element) {
  return (
    (element.textContent?.replace(/\s+/g, " ").trim().length ?? 0) >=
    MINIMUM_TEXT_LENGTH
  )
}

function isTopLevelTextElement(element: Element, candidates: Set<Element>) {
  let parent = element.parentElement

  while (parent) {
    if (candidates.has(parent)) return false
    parent = parent.parentElement
  }

  return true
}

function isNearViewport(element: Element) {
  const rect = element.getBoundingClientRect()

  return (
    element.getClientRects().length > 0 &&
    rect.top < window.innerHeight * 1.16 &&
    rect.bottom > -24
  )
}

export function RevealProvider() {
  const location = useLocation()

  useEffect(() => {
    document
      .querySelectorAll(
        ".reveal-text-target, .reveal-element-target, .is-revealed"
      )
      .forEach((element) => {
        element.classList.remove(
          "reveal-text-target",
          "reveal-element-target",
          "is-revealed"
        )
        element.style.removeProperty("--reveal-delay")
      })

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const preparedElements = new Set<Element>()
    const pendingElements = new Set<Element>()
    let prepareFrame = 0
    let visibilityPrimeFrame = 0
    let visibilityFrame = 0

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          scheduleVisibilityCheck()
        }
      },
      {
        rootMargin: "0px 0px 18% 0px",
        threshold: 0.01,
      }
    )

    function reveal(element: Element) {
      element.classList.add("is-revealed")
      pendingElements.delete(element)
      observer.unobserve(element)
    }

    function checkVisibleElements() {
      visibilityFrame = 0

      pendingElements.forEach((element) => {
        if (!element.isConnected) {
          pendingElements.delete(element)
          observer.unobserve(element)
          return
        }

        if (reducedMotion.matches || isNearViewport(element)) {
          reveal(element)
        }
      })
    }

    function scheduleVisibilityCheck() {
      if (visibilityPrimeFrame || visibilityFrame) return

      visibilityPrimeFrame = window.requestAnimationFrame(() => {
        visibilityPrimeFrame = 0
        visibilityFrame = window.requestAnimationFrame(checkVisibleElements)
      })
    }

    function registerElement(element: Element) {
      if (preparedElements.has(element)) return

      preparedElements.add(element)
      pendingElements.add(element)

      if (reducedMotion.matches) {
        reveal(element)
        return
      }

      observer.observe(element)
    }

    function prepare() {
      prepareFrame = 0

      const textCandidates = new Set(
        Array.from(document.querySelectorAll(TEXT_SELECTOR)).filter(
          hasVisibleText
        )
      )

      Array.from(textCandidates)
        .filter((element) => isTopLevelTextElement(element, textCandidates))
        .forEach((element, index) => {
          element.classList.add("reveal-text-target")
          element.style.setProperty("--reveal-delay", `${(index % 3) * 30}ms`)
          registerElement(element)
        })

      Array.from(document.querySelectorAll(ELEMENT_SELECTOR))
        .filter((element) => !element.closest(".reveal-text-target"))
        .forEach((element, index) => {
          element.classList.add("reveal-element-target")
          element.style.setProperty("--reveal-delay", `${(index % 3) * 24}ms`)
          registerElement(element)
        })

      scheduleVisibilityCheck()
    }

    function schedulePrepare() {
      if (prepareFrame) return
      prepareFrame = window.requestAnimationFrame(prepare)
    }

    prepare()

    const mutationObserver = new MutationObserver(schedulePrepare)
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    const handleMotionPreferenceChange = () => {
      if (reducedMotion.matches) checkVisibleElements()
    }

    window.addEventListener("scroll", scheduleVisibilityCheck, {
      passive: true,
    })
    window.addEventListener("resize", scheduleVisibilityCheck)
    reducedMotion.addEventListener("change", handleMotionPreferenceChange)

    return () => {
      window.cancelAnimationFrame(prepareFrame)
      window.cancelAnimationFrame(visibilityPrimeFrame)
      window.cancelAnimationFrame(visibilityFrame)
      window.removeEventListener("scroll", scheduleVisibilityCheck)
      window.removeEventListener("resize", scheduleVisibilityCheck)
      mutationObserver.disconnect()
      observer.disconnect()
      reducedMotion.removeEventListener("change", handleMotionPreferenceChange)
      preparedElements.clear()
      pendingElements.clear()
    }
  }, [location.key])

  return null
}
