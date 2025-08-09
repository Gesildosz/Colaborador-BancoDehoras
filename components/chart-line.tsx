"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type Point = { date: Date; value: number }

export function ChartLine({
  data = [],
  height = 240,
  stroke = "hsl(142.1 70.6% 45.3%)",
  grid = true,
}: {
  data?: Point[]
  height?: number
  stroke?: string
  grid?: boolean
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setWidth(el.clientWidth || 600)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const padding = { top: 16, right: 16, bottom: 24, left: 36 }
  const innerW = Math.max(1, width - padding.left - padding.right)
  const innerH = Math.max(1, height - padding.top - padding.bottom)

  const { pathD, ticksX, ticksY, minY, maxY, scaled } = useMemo(() => {
    const pts = (data || []).slice().sort((a, b) => a.date.getTime() - b.date.getTime())
    const xs = pts.map((p) => p.date.getTime())
    const ys = pts.map((p) => p.value)
    const minX = xs.length ? Math.min(...xs) : 0
    const maxX = xs.length ? Math.max(...xs) : 1
    const minY0 = ys.length ? Math.min(...ys, 0) : 0
    const maxY0 = ys.length ? Math.max(...ys, 0) : 10
    const yPad = Math.max(1, (maxY0 - minY0) * 0.1)
    const y0 = minY0 - yPad
    const y1 = maxY0 + yPad

    const scaleX = (x: number) => {
      if (maxX === minX) return 0
      return ((x - minX) / (maxX - minX)) * innerW
    }
    const scaleY = (y: number) => {
      if (y1 === y0) return innerH / 2
      return innerH - ((y - y0) / (y1 - y0)) * innerH
    }

    const p2 = pts.map((p) => ({ x: scaleX(p.date.getTime()), y: scaleY(p.value), raw: p }))
    const pathD = buildSmoothPath(p2)

    const ticksY = buildTicks(y0, y1, 4)
    const ticksX = buildTimeTicks(minX, maxX, 4)

    return { pathD, ticksX, ticksY, minY: y0, maxY: y1, scaled: p2 }
  }, [data, innerW, innerH])

  return (
    <div ref={containerRef} className="w-full">
      <svg width={width} height={height} role="img" aria-label="Gráfico de linha com histórico de saldo de horas">
        <g transform={`translate(${padding.left},${padding.top})`}>
          {grid &&
            ticksY.map((t, i) => {
              const y = mapLinear(t, minY, maxY, innerH, 0)
              return (
                <g key={`gy-${i}`}>
                  <line x1={0} x2={innerW} y1={y} y2={y} stroke="hsl(0 0% 80%)" strokeDasharray="4 4" />
                  <text x={-8} y={y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="hsl(0 0% 40%)">
                    {formatNumber(t)} h
                  </text>
                </g>
              )
            })}
          {grid &&
            ticksX.map((t, i) => {
              const x = mapLinear(
                t.value,
                ticksX[0]?.value ?? t.value,
                ticksX[ticksX.length - 1]?.value ?? t.value,
                0,
                innerW,
              )
              return (
                <g key={`gx-${i}`}>
                  <line x1={x} x2={x} y1={0} y2={innerH} stroke="hsl(0 0% 90%)" />
                  <text x={x} y={innerH + 16} textAnchor="middle" fontSize="10" fill="hsl(0 0% 40%)">
                    {t.label}
                  </text>
                </g>
              )
            })}
          <path d={pathD} fill="none" stroke={stroke} strokeWidth={2.25} />
          {scaled.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={stroke} />
          ))}
        </g>
      </svg>
    </div>
  )
}

function buildSmoothPath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return ""
  if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`
  const d: string[] = []
  d.push(`M ${pts[0].x},${pts[0].y}`)
  const cr = 0.2
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? i : i - 1]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * cr * 3
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * cr * 3
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * cr * 3
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * cr * 3

    d.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`)
  }
  return d.join(" ")
}

function buildTicks(min: number, max: number, count: number) {
  if (min === max) return [min]
  const step = (max - min) / count
  const ticks: number[] = []
  for (let i = 0; i <= count; i++) ticks.push(min + i * step)
  return ticks
}

function buildTimeTicks(min: number, max: number, count: number) {
  if (min === max) return [{ value: min, label: new Date(min).toLocaleDateString("pt-BR") }]
  const step = (max - min) / count
  const ticks: { value: number; label: string }[] = []
  for (let i = 0; i <= count; i++) {
    const v = min + i * step
    ticks.push({ value: v, label: new Date(v).toLocaleDateString("pt-BR") })
  }
  return ticks
}

function mapLinear(v: number, a: number, b: number, A: number, B: number) {
  if (a === b) return (A + B) / 2
  return A + ((v - a) / (b - a)) * (B - A)
}

function formatNumber(n: number) {
  return Math.round(n * 10) / 10
}
