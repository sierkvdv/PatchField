import React from 'react'
import Draggable from 'react-draggable'
import { ModuleInstance } from '../../patch/types'
import { moveModule, removeModule, setPortPos } from '../../patch/store'
import { getModuleUI } from '../../modules/registry'

export const ModuleView: React.FC<{ mod: ModuleInstance }> = ({ mod }) => {
  const UI = getModuleUI(mod.type)
  return (
    <Draggable position={{ x: mod.x, y: mod.y }}
      onDrag={(_, d) => {
        moveModule(mod.id, d.x, d.y)
        // After moving the module, recompute all jack positions inside it
        const el = document.querySelector(`[data-module-id="${mod.id}"]`) as HTMLElement | null
        const rackEl = document.querySelector('.rack') as HTMLElement | null
        if (el && rackEl) {
          const rack = rackEl.getBoundingClientRect()
          el.querySelectorAll('.jack').forEach((j) => {
            const jr = (j as HTMLElement).getBoundingClientRect()
            const port = (j as HTMLElement).getAttribute('data-port-key') || ''
            if (port) setPortPos(mod.id, port, { x: jr.left - rack.left + rackEl.scrollLeft + jr.width/2, y: jr.top - rack.top + rackEl.scrollTop + jr.height/2 })
          })
        }
      }} handle=".handle">
      <div className="module" data-module-id={mod.id} data-module-type={mod.type}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <h3 className="handle">🎚 {mod.title}</h3>
          <button className="btn" onClick={() => removeModule(mod.id)} title="Remove">✖</button>
        </div>
        <UI mod={mod} />
      </div>
    </Draggable>
  )
}
