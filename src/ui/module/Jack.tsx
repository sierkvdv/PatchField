import React, { useLayoutEffect, useRef } from 'react'
import { beginPatch, setPortPos, tryCompletePatch, usePatch } from '../../patch/store'
import { usePatch as usePatchStore } from '../../patch/store'
import { Connection } from '../../patch/types'

/**
 * Jack component representing an input or output port on a module.
 * This version ensures port positions are recalculated on scroll and resize
 * events using capture mode and cleans up listeners correctly.
 */
export const Jack: React.FC<{
  moduleId: string
  portKey: string
  label: string
  direction: 'in' | 'out'
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
      const rackEl = document.querySelector('.rack') as HTMLElement
      if (!rackEl) return
      const rack = rackEl.getBoundingClientRect()
      // Include scroll offsets so coordinates are relative to the rack's
      // scrollable content origin, not just the visible viewport.
      setPortPos(moduleId, portKey, {
        x: rect.left - rack.left + rackEl.scrollLeft + rect.width / 2,
        y: rect.top - rack.top + rackEl.scrollTop + rect.height / 2,
      })
    }

    // Initial updates and slight delays to catch animations
    update()
    const t1 = setTimeout(update, 50)
    const t2 = setTimeout(update, 200)

    // Observe size changes of the jack itself
    const ro = new ResizeObserver(update)
    ro.observe(el)

    // Listen for scroll and resize events with capture mode (true)
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
  }, [moduleId, portKey])

  // Click toggles patch begin/complete (avoids mousedown/up self-connections)
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

  // Contextmenu/right-click: remove all existing connections for this port to make re-patching easy
  const onContextMenu: React.MouseEventHandler = (e) => {
    e.preventDefault(); e.stopPropagation()
    usePatchStore.getState().removeConnectionsForPort(moduleId, portKey)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {direction === 'in' && <span className="jack-label">{label}</span>}
      <div
        ref={ref}
        className={`jack ${direction} ${kind === 'event' ? 'event' : kind}`}
        onClick={onClick}
        onContextMenu={onContextMenu}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        data-module-id={moduleId}
        data-port-key={portKey}
        title={`${direction} ${label}`}
      />
      {direction === 'out' && <span className="jack-label">{label}</span>}
    </div>
  )
}
