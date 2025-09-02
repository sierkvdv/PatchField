import React, { useLayoutEffect, useRef } from 'react'
import { beginPatch, setPortPos, tryCompletePatch, usePatch } from '../../patch/store'
import { Connection } from '../../patch/types'

export const Jack: React.FC<{
  moduleId: string
  portKey: string
  label: string
  direction: 'in'|'out'
  kind: Connection['kind']
}> = ({ moduleId, portKey, label, direction, kind }) => {
  const ref = useRef<HTMLDivElement>(null)
  const patchFrom = usePatch(s => s.patchFrom)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      const rack = document.querySelector('.rack')!.getBoundingClientRect()
      setPortPos(moduleId, portKey, { x: rect.left - rack.left + rect.width/2, y: rect.top - rack.top + rect.height/2 })
    }
    update()
    const t1 = setTimeout(update, 50)
    const t2 = setTimeout(update, 200)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
         return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        ro.disconnect()
        window.removeEventListener('scroll', update, true)
        window.removeEventListener('resize', update)
      }
    })

}

  const onMouseDown: React.MouseEventHandler = (e) => { e.stopPropagation(); beginPatch({ moduleId, portKey, kind }) }
  const onMouseUp: React.MouseEventHandler = (e) => { e.stopPropagation(); tryCompletePatch({ moduleId, portKey, kind }) }
  const onClick: React.MouseEventHandler = (e) => { e.stopPropagation(); if (patchFrom) tryCompletePatch({ moduleId, portKey, kind }); else beginPatch({ moduleId, portKey, kind }) }
  const onTouchStart: React.TouchEventHandler = (e) => { e.stopPropagation(); beginPatch({ moduleId, portKey, kind }) }
  const onTouchEnd: React.TouchEventHandler = (e) => { e.stopPropagation(); tryCompletePatch({ moduleId, portKey, kind }) }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {direction === 'in' && <span className="jack-label">{label}</span>}
      <div
        ref={ref}
        className={`jack ${direction} ${kind === 'event' ? 'event' : kind}`}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onClick={onClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        title={`${direction} ${label}`}
      />
      {direction === 'out' && <span className="jack-label">{label}</span>}
    </div>
  )
}
