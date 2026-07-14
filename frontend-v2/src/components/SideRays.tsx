import { useEffect, useRef } from "react"
import { Mesh, Program, Renderer, Triangle } from "ogl"

type Origin = "top-right" | "top-left" | "bottom-right" | "bottom-left"

type SideRaysProps = {
  speed?: number
  rayColor1?: string
  rayColor2?: string
  intensity?: number
  spread?: number
  origin?: Origin
  tilt?: number
  saturation?: number
  blend?: number
  falloff?: number
  opacity?: number
  className?: string
}

function hexToRgb(hex: string): [number, number, number] {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  return match
    ? [
        parseInt(match[1], 16) / 255,
        parseInt(match[2], 16) / 255,
        parseInt(match[3], 16) / 255,
      ]
    : [1, 1, 1]
}

function originToFlip(origin: Origin): [number, number] {
  switch (origin) {
    case "top-left":
      return [1, 0]
    case "bottom-right":
      return [0, 1]
    case "bottom-left":
      return [1, 1]
    default:
      return [0, 0]
  }
}

const vertexShader = `
attribute vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform float iSpeed;
uniform vec3 iRayColor1;
uniform vec3 iRayColor2;
uniform float iIntensity;
uniform float iSpread;
uniform float iFlipX;
uniform float iFlipY;
uniform float iTilt;
uniform float iSaturation;
uniform float iBlend;
uniform float iFalloff;
uniform float iOpacity;

float rayStrength(
  vec2 raySource,
  vec2 rayDirection,
  vec2 coord,
  float seedA,
  float seedB,
  float speed
) {
  vec2 sourceToCoord = coord - raySource;
  float cosAngle = dot(normalize(sourceToCoord), rayDirection);

  return clamp(
    (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
    0.0,
    1.0
  ) * clamp(
    (iResolution.x - length(sourceToCoord)) / iResolution.x,
    0.5,
    1.0
  );
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;

  if (iFlipX > 0.5) fragCoord.x = iResolution.x - fragCoord.x;
  if (iFlipY > 0.5) fragCoord.y = iResolution.y - fragCoord.y;

  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  vec2 rayPosition = vec2(iResolution.x * 1.1, -0.5 * iResolution.y);
  float tiltRadians = iTilt * 3.14159265 / 180.0;
  float cosine = cos(tiltRadians);
  float sine = sin(tiltRadians);
  vec2 relativeCoord = coord - rayPosition;
  vec2 tiltedCoord = vec2(
    relativeCoord.x * cosine - relativeCoord.y * sine,
    relativeCoord.x * sine + relativeCoord.y * cosine
  ) + rayPosition;
  float halfSpread = iSpread * 0.275;
  vec2 direction1 = normalize(vec2(
    cos(0.785398 + halfSpread),
    sin(0.785398 + halfSpread)
  ));
  vec2 direction2 = normalize(vec2(
    cos(0.785398 - halfSpread),
    sin(0.785398 - halfSpread)
  ));
  vec4 rays1 = vec4(iRayColor1, 1.0) * rayStrength(
    rayPosition,
    direction1,
    tiltedCoord,
    36.2214,
    21.11349,
    iSpeed
  );
  vec4 rays2 = vec4(iRayColor2, 1.0) * rayStrength(
    rayPosition,
    direction2,
    tiltedCoord,
    22.3991,
    18.0234,
    iSpeed * 0.2
  );
  vec4 color = rays1 * (1.0 - iBlend) * 0.9 + rays2 * iBlend * 0.9;
  float distanceToLight = length(
    fragCoord.xy - vec2(rayPosition.x, iResolution.y - rayPosition.y)
  ) / iResolution.y;
  float brightness = iIntensity * 0.4 / pow(
    max(distanceToLight, 0.001),
    iFalloff
  );

  color.rgb *= brightness;
  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb = mix(vec3(gray), color.rgb, iSaturation);
  color.a = max(color.r, max(color.g, color.b)) * iOpacity;
  gl_FragColor = color;
}
`

export default function SideRays({
  speed = 2.5,
  rayColor1 = "#EAB308",
  rayColor2 = "#96c8ff",
  intensity = 2,
  spread = 2,
  origin = "top-right",
  tilt = 0,
  saturation = 1.5,
  blend = 0.75,
  falloff = 2,
  opacity = 1,
  className = "",
}: SideRaysProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({
      alpha: true,
      dpr: Math.min(window.devicePixelRatio, 1.5),
    })
    const gl = renderer.gl
    const [flipX, flipY] = originToFlip(origin)
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      iSpeed: { value: speed },
      iRayColor1: { value: hexToRgb(rayColor1) },
      iRayColor2: { value: hexToRgb(rayColor2) },
      iIntensity: { value: intensity },
      iSpread: { value: spread },
      iFlipX: { value: flipX },
      iFlipY: { value: flipY },
      iTilt: { value: tilt },
      iSaturation: { value: saturation },
      iBlend: { value: blend },
      iFalloff: { value: falloff },
      iOpacity: { value: opacity },
    }
    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms,
    })
    const mesh = new Mesh(gl, { geometry, program })
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let animationFrame = 0
    let isVisible = true

    gl.canvas.style.width = "100%"
    gl.canvas.style.height = "100%"
    container.replaceChildren(gl.canvas)

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      uniforms.iResolution.value = [width * renderer.dpr, height * renderer.dpr]
    }

    const render = (time: number) => {
      if (!isVisible) return
      uniforms.iTime.value = time * 0.001
      renderer.render({ scene: mesh })
      if (!reduceMotion.matches) animationFrame = requestAnimationFrame(render)
    }

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      const wasVisible = isVisible
      isVisible = entry.isIntersecting

      if (isVisible && !wasVisible) {
        cancelAnimationFrame(animationFrame)
        animationFrame = requestAnimationFrame(render)
      }
    })
    const resizeObserver = new ResizeObserver(resize)

    visibilityObserver.observe(container)
    resizeObserver.observe(container)
    resize()
    animationFrame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrame)
      visibilityObserver.disconnect()
      resizeObserver.disconnect()
      container.replaceChildren()
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [
    blend,
    falloff,
    intensity,
    opacity,
    origin,
    rayColor1,
    rayColor2,
    saturation,
    speed,
    spread,
    tilt,
  ])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none h-full w-full overflow-hidden ${className}`}
    />
  )
}
