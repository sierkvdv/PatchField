import React, { useLayoutEffect, useRef } from 'react'
import { beginPatch, setPortPos, tryCompletePatch, usePatch } from '../../patch/store'
import { Connection } from '../../patch/types'

/**
 * Jack component representing an input or output port on a module.
 * This version ensures port positions are recalculated on scroll and resize
 * events using capture mode and cleans up listeners correctly. Patch cables
 * will stay anchored when the user scrolls.
 */
export const Jack: React.FC<{
  moduleId: string
  portKey: string
  label: string
  direction: 'in'|'out'
  kind: Connection['kind']
}> = ({ moduleId, portKey, label, direction, kind }) => {
  const ref = useRef<HTMLDivElement>(null)
  const patchFrom = usePatch((s) => s.patchFrom)

  // Update port position and attach/detach listeners on mount/unmount
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    // Updates the stored port position relative to the rack
    const update = () => {
      const rect = el.getBoundingClientRect()
      const rack = document.querySelector('.rack')!.getBoundingClientRect()
      setPortPos(moduleId, portKey, {
        x: rect.left - rack.left + rect.width / 2,
        y: rect.top - rack.top + rect.height / 2,
      })
    }

    // Initial updates and slight delays to catch animations
    update()
    const t1 = setTimeout(update, 50)
    const t2 = setTimeout(update, 200)

    // Observe size changes of the jack itself
    const ro = new ResizeObserver(update)
    ro.observe(el)

    // Listen for scroll and resize events with capture mode (true) to keep cables anchored when the page scrolls
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update, true)

    // Cleanup when component unmounts
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      ro.disconnect()
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update, true)
    }
  })

  // Start a patch from this jack on mouse/touch interactions
  const onMouseDown: React.MouseEventHandler = (e) => {
    e.stopPropagation()
    beginPatch({ moduleId, portKey, kind })
  }
  const onMouseUp: React.MouseEventHandler = (e) => {
    e.stopPropagation()
    tryCompletePatch({ moduleId, portKey, kind })
  }
  const onClick: React.MouseEventHandler = (e) => {
    e.stopPropagation()
    if (patchFrom) tryCompletePatch({ moduleId, portKey, kind })
    else beginPatch({ moduleId, portKey, kind })
  }
  const onTouchStart: React.TouchEventHandler = (e) => {
    e.stopPropagation()
    beginPatch({ moduleId, portKey, kind })
  }
  const onTouchEnd: React.TouchEventHandler = (e) => {
    e.stopPropagation()
    tryCompletePatch({ moduleId, portKey, kind })
  }

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
