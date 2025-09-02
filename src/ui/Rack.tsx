import React from 'react'
import { usePatch, updateMouse, cancelPatch } from '../patch/store'
import { ModuleView } from './module/ModuleView'
import { Wires } from './module/Wires'

const Rack: React.FC = () => {
  const modules = usePatch(s => s.modules)
  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rackEl = e.currentTarget as HTMLDivElement
    const rect = rackEl.getBoundingClientRect()
    updateMouse(e.clientX - rect.left + rackEl.scrollLeft, e.clientY - rect.top + rackEl.scrollTop)
  }
  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const rackEl = e.currentTarget as HTMLDivElement
    const rect = rackEl.getBoundingClientRect()
    const t = e.touches[0]; if (!t) return
    updateMouse(t.clientX - rect.left + rackEl.scrollLeft, t.clientY - rect.top + rackEl.scrollTop)
  }
  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    // Klik op lege ruimte annuleert tijdelijk patchen
    const target = e.target as HTMLElement
    if (!target.closest('.jack')) {
      cancelPatch()
    }
  }
  return (
    <div className="rack" onMouseMove={onMouseMove} onTouchMove={onTouchMove} onMouseDown={onMouseDown}>
      {modules.map(m => <ModuleView key={m.id} mod={m} />)}
      <Wires />
    </div>
  )
}
export default Rack
