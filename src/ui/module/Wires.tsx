import React from 'react'
import { usePatch } from '../../patch/store'

function pathBetween(a: {x:number,y:number}, b: {x:number,y:number}) {
  const dx = Math.abs(b.x - a.x)
  const c = Math.max(30, dx * 0.5)
  return `M ${a.x} ${a.y} C ${a.x + c} ${a.y}, ${b.x - c} ${b.y}, ${b.x} ${b.y}`
}

function getFallbackPos(moduleId: string): {x:number,y:number} | null {
  const rack = document.querySelector('.rack') as HTMLElement
  const el = document.querySelector(`[data-module-id="${moduleId}"]`) as HTMLElement
  if (!rack || !el) return null
  const rRect = rack.getBoundingClientRect()
  const mRect = el.getBoundingClientRect()
  return { x: mRect.left - rRect.left + mRect.width/2, y: mRect.top - rRect.top + mRect.height/2 }
}

export const Wires: React.FC = () => {
  const connections = usePatch(s => s.connections)
  const portPos = usePatch(s => s.portPos)
  const patchFrom = usePatch(s => s.patchFrom)
  const mouse = usePatch(s => s.mouse)

  const items = connections.map(c => {
    const a = portPos[`${c.from.moduleId}:${c.from.portKey}`] || getFallbackPos(c.from.moduleId)
    const b = portPos[`${c.to.moduleId}:${c.to.portKey}`] || getFallbackPos(c.to.moduleId)
    if (!a || !b) return null
    const p = pathBetween(a, b)
    const cls = c.kind === 'event' ? 'event' : (c.kind === 'param' || c.kind === 'control' ? 'control' : 'audio')
    return <path key={c.id} className={`wire ${cls}`} d={p} />
  })

  let tempPath: JSX.Element | null = null
   if (patchFrom && mouse) {
    const a = portPos[`${patchFrom.moduleId}:${patchFrom.portKey}`] || getFallbackPos(patchFrom.moduleId)
    if (a) {
      const p = pathBetween(a, mouse)
      const cls =
        patchFrom.kind === 'event'
          ? 'event'
          : patchFrom.kind === 'param' || patchFrom.kind === 'control'
          ? 'control'
          : 'audio'
      tempPath = <path className={`wire ${cls}`} d={p} />
    }
  }

  return (
    <svg className="wire-layer" style={{ width: '100%', height: '100%' }}>
      {items}
      {tempPath}
    </svg>
  )
}

