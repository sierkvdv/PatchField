import React from 'react'
import Draggable from 'react-draggable'
import { ModuleInstance } from '../../patch/types'
import { moveModule, removeModule } from '../../patch/store'
import { getModuleUI } from '../../modules/registry'

export const ModuleView: React.FC<{ mod: ModuleInstance }> = ({ mod }) => {
  const UI = getModuleUI(mod.type)
  return (
    <Draggable position={{ x: mod.x, y: mod.y }} onDrag={(_, d) => moveModule(mod.id, d.x, d.y)} handle=".handle">
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
