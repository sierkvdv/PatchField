import React from 'react'
import { usePatch, updateMouse } from '../patch/store'
import { ModuleView } from './module/ModuleView'
import { Wires } from './module/Wires'

const Rack: React.FC = () => {
  const modules = usePatch(s => s.modules)
  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    updateMouse(e.clientX - rect.left, e.clientY - rect.top)
  }
  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const t = e.touches[0]; if (!t) return
    updateMouse(t.clientX - rect.left, t.clientY - rect.top)
  }
  return (
    <div className="rack" onMouseMove={onMouseMove} onTouchMove={onTouchMove}>
      {modules.map(m => <ModuleView key={m.id} mod={m} />)}
      <Wires />
    </div>
  )
}
export default Rack
