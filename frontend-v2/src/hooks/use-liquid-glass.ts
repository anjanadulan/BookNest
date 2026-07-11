import { useCallback, useEffect, useRef } from "react"

const SVG_NAMESPACE = "http://www.w3.org/2000/svg"

type LiquidGlassOptions = {
  scale?: number
  chroma?: number
  border?: number
  mapBlur?: number
  blur?: number
  saturate?: number
  radius?: number
  fallbackBlur?: number
}

type LiquidGlassInstance = {
  destroy: () => void
}

let filterId = 0
let sharedDefs: SVGDefsElement | null = null

function supportsLiquidGlass() {
  const userAgent = navigator.userAgent
  const isSafari =
    /Safari/.test(userAgent) && !/Chrome|Chromium|Edg/.test(userAgent)
  const isFirefox = /Firefox/.test(userAgent)

  return (
    !isSafari &&
    !isFirefox &&
    CSS.supports("backdrop-filter", "url(#liquid-glass)")
  )
}

function ensureSvgDefs() {
  if (sharedDefs) return sharedDefs

  const svg = document.createElementNS(SVG_NAMESPACE, "svg")
  svg.setAttribute("width", "0")
  svg.setAttribute("height", "0")
  svg.setAttribute("aria-hidden", "true")
  svg.style.position = "absolute"
  sharedDefs = document.createElementNS(SVG_NAMESPACE, "defs")
  svg.appendChild(sharedDefs)
  document.body.appendChild(svg)
  return sharedDefs
}

function createDisplacementMap(
  width: number,
  height: number,
  radius: number,
  border: number,
  mapBlur: number
) {
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")

  canvas.width = width
  canvas.height = height
  if (!context) return ""

  const horizontalGradient = context.createLinearGradient(0, 0, width, 0)
  horizontalGradient.addColorStop(0, "rgb(0,0,0)")
  horizontalGradient.addColorStop(1, "rgb(255,0,0)")
  context.fillStyle = horizontalGradient
  context.fillRect(0, 0, width, height)

  const verticalGradient = context.createLinearGradient(0, 0, 0, height)
  verticalGradient.addColorStop(0, "rgb(0,0,0)")
  verticalGradient.addColorStop(1, "rgb(0,0,255)")
  context.globalCompositeOperation = "difference"
  context.fillStyle = verticalGradient
  context.fillRect(0, 0, width, height)

  const inset = border * Math.min(width, height)
  context.globalCompositeOperation = "source-over"
  context.filter = `blur(${mapBlur}px)`
  context.fillStyle = "rgba(128,128,128,0.93)"
  context.beginPath()
  context.roundRect(
    inset,
    inset,
    width - inset * 2,
    height - inset * 2,
    Math.max(radius - inset, 2)
  )
  context.fill()
  context.filter = "none"

  return canvas.toDataURL()
}

function createSvgFilter(id: string, scales: number[]) {
  const filter = document.createElementNS(SVG_NAMESPACE, "filter")
  filter.setAttribute("id", id)
  filter.setAttribute("x", "0")
  filter.setAttribute("y", "0")
  filter.setAttribute("width", "100%")
  filter.setAttribute("height", "100%")
  filter.setAttribute("color-interpolation-filters", "sRGB")

  const image = document.createElementNS(SVG_NAMESPACE, "feImage")
  image.setAttribute("x", "0")
  image.setAttribute("y", "0")
  image.setAttribute("result", "map")
  image.setAttribute("preserveAspectRatio", "none")
  filter.appendChild(image)

  const channelMatrices = [
    "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
  ]

  channelMatrices.forEach((matrix, index) => {
    const displacement = document.createElementNS(
      SVG_NAMESPACE,
      "feDisplacementMap"
    )
    displacement.setAttribute("in", "SourceGraphic")
    displacement.setAttribute("in2", "map")
    displacement.setAttribute("scale", String(scales[index]))
    displacement.setAttribute("xChannelSelector", "R")
    displacement.setAttribute("yChannelSelector", "B")
    displacement.setAttribute("result", `displaced-${index}`)
    filter.appendChild(displacement)

    const colorMatrix = document.createElementNS(SVG_NAMESPACE, "feColorMatrix")
    colorMatrix.setAttribute("in", `displaced-${index}`)
    colorMatrix.setAttribute("type", "matrix")
    colorMatrix.setAttribute("values", matrix)
    colorMatrix.setAttribute("result", `channel-${index}`)
    filter.appendChild(colorMatrix)
  })

  const firstBlend = document.createElementNS(SVG_NAMESPACE, "feBlend")
  firstBlend.setAttribute("in", "channel-0")
  firstBlend.setAttribute("in2", "channel-1")
  firstBlend.setAttribute("mode", "screen")
  firstBlend.setAttribute("result", "channels-01")
  filter.appendChild(firstBlend)

  const secondBlend = document.createElementNS(SVG_NAMESPACE, "feBlend")
  secondBlend.setAttribute("in", "channels-01")
  secondBlend.setAttribute("in2", "channel-2")
  secondBlend.setAttribute("mode", "screen")
  filter.appendChild(secondBlend)

  ensureSvgDefs().appendChild(filter)
  return { filter, image }
}

function resolveRadius(element: HTMLElement, override?: number) {
  if (override !== undefined) return override

  const rawRadius = getComputedStyle(element).borderTopLeftRadius || "0px"
  const value = parseFloat(rawRadius) || 0

  return rawRadius.trim().endsWith("%")
    ? (value / 100) * Math.min(element.offsetWidth, element.offsetHeight)
    : value
}

function applyLiquidGlass(
  element: HTMLElement,
  options: Required<LiquidGlassOptions>
): LiquidGlassInstance {
  const prefixedStyle = element.style as CSSStyleDeclaration & {
    webkitBackdropFilter: string
  }

  if (!supportsLiquidGlass()) {
    const fallback = `blur(${options.fallbackBlur}px) saturate(${options.saturate})`
    element.style.backdropFilter = fallback
    prefixedStyle.webkitBackdropFilter = fallback
    element.classList.add("liquid-glass-fallback")

    return {
      destroy: () => {
        element.style.backdropFilter = ""
        prefixedStyle.webkitBackdropFilter = ""
        element.classList.remove("liquid-glass-fallback")
      },
    }
  }

  const id = `liquid-glass-filter-${++filterId}`
  const scales = [
    options.scale,
    options.scale + options.chroma,
    options.scale + options.chroma * 2,
  ]
  const { filter, image } = createSvgFilter(id, scales)
  let resizeTimer = 0

  const refresh = () => {
    const width = element.offsetWidth
    const height = element.offsetHeight
    if (!width || !height) return

    image.setAttribute(
      "href",
      createDisplacementMap(
        width,
        height,
        resolveRadius(element, options.radius),
        options.border,
        options.mapBlur
      )
    )
    image.setAttribute("width", String(width))
    image.setAttribute("height", String(height))
  }

  const resizeObserver = new ResizeObserver(() => {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(refresh, 120)
  })

  refresh()
  element.style.backdropFilter = `url(#${id}) blur(${options.blur}px) saturate(${options.saturate})`
  resizeObserver.observe(element)

  return {
    destroy: () => {
      resizeObserver.disconnect()
      window.clearTimeout(resizeTimer)
      filter.remove()
      element.style.backdropFilter = ""
    },
  }
}

export function useLiquidGlass<T extends HTMLElement>(
  options: LiquidGlassOptions = {}
) {
  const {
    scale = -92,
    chroma = 5,
    border = 0.07,
    mapBlur = 12,
    blur = 3,
    saturate = 1.5,
    radius = 999,
    fallbackBlur = 18,
  } = options
  const cleanupRef = useRef<(() => void) | null>(null)

  const ref = useCallback(
    (element: T | null) => {
      cleanupRef.current?.()
      cleanupRef.current = null
      if (!element) return

      const instance = applyLiquidGlass(element, {
        scale,
        chroma,
        border,
        mapBlur,
        blur,
        saturate,
        radius,
        fallbackBlur,
      })
      cleanupRef.current = instance.destroy
    },
    [border, blur, chroma, fallbackBlur, mapBlur, radius, saturate, scale]
  )

  useEffect(
    () => () => {
      cleanupRef.current?.()
    },
    []
  )

  return ref
}
