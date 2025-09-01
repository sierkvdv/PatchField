import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'

export const multipleTemplate = {
  title: 'Multiple (split)',
  defaults: {},
  ports: [
    { key: 'in', label: 'IN', direction: 'in', kind: 'audio' } as PortSpec,
    { key: 'out1', label: 'OUT1', direction: 'out', kind: 'audio' } as PortSpec,
    { key: 'out2', label: 'OUT2', direction: 'out', kind: 'audio' } as PortSpec,
    { key: 'out3', label: 'OUT3', direction: 'out', kind: 'audio' } as PortSpec,
  ]
}

export function createMultipleRuntime(mod: ModuleInstance): ModuleRuntime {
  const g = new Tone.Gain(1)
  return { getOut:(k)=> (k==='out1'||k==='out2'||k==='out3'?g:null), getIn:(k)=> (k==='in'?g:null), update:()=>{}, dispose:()=>{ g.dispose() } }
}

export const MultipleUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="jack-row">
      <Jack moduleId={mod.id} portKey="in" label="IN" direction="in" kind="audio" />
      <Jack moduleId={mod.id} portKey="out1" label="OUT1" direction="out" kind="audio" />
      <Jack moduleId={mod.id} portKey="out2" label="OUT2" direction="out" kind="audio" />
      <Jack moduleId={mod.id} portKey="out3" label="OUT3" direction="out" kind="audio" />
    </div>
    <p className="muted">Duplicate a signal to multiple destinations.</p>
  </div>
)
