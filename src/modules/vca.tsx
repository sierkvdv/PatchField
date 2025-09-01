import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'

export const vcaTemplate = {
  title: 'VCA',
  defaults: { gain: 0 },
  ports: [
    { key: 'in', label: 'IN', direction: 'in', kind: 'audio' } as PortSpec,
    { key: 'out', label: 'OUT', direction: 'out', kind: 'audio' } as PortSpec,
    { key: 'cv', label: 'CV (gain)', direction: 'in', kind: 'control' } as PortSpec,
  ]
}

export function createVCARuntime(mod: ModuleInstance): ModuleRuntime {
  const gain = new Tone.Gain(mod.params.gain)
  return {
    getOut:(k)=>(k==='out'?gain:null),
    getIn:(k)=>{ if (k==='in') return gain; if (k==='cv') return gain.gain as any; return null },
    update:(m)=>{ (gain.gain as any).value = m.params.gain },
    dispose:()=>{ gain.dispose() }
  }
}

export const VCAUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="jack-row">
      <Jack moduleId={mod.id} portKey="in" label="IN" direction="in" kind="audio" />
      <Jack moduleId={mod.id} portKey="out" label="OUT" direction="out" kind="audio" />
      <Jack moduleId={mod.id} portKey="cv" label="CV" direction="in" kind="control" />
    </div>
    <p className="muted">ADSR → CV, audio → IN, OUT → Mixer/Output.</p>
  </div>
)
