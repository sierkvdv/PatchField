import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'

export const attenTemplate = {
  title: 'Attenuator (CV)',
  defaults: { amount: 1 },
  ports: [
    { key: 'in', label: 'IN (CV)', direction: 'in', kind: 'control' } as PortSpec,
    { key: 'out', label: 'OUT (CV)', direction: 'out', kind: 'control' } as PortSpec,
  ]
}

export function createAttenRuntime(mod: ModuleInstance): ModuleRuntime {
  const gain = new Tone.Gain(mod.params.amount)
  return { getOut:(k)=>(k==='out'?gain:null), getIn:(k)=>(k==='in'?gain:null), update:(m)=>{ (gain.gain as any).value = m.params.amount }, dispose:()=>{ gain.dispose() } }
}

export const AttenuatorUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="slider"><label>Amount {mod.params.amount.toFixed(2)}</label><input type="range" min={0} max={1} step={0.01} value={mod.params.amount} onChange={e => setParam(mod.id, 'amount', parseFloat(e.target.value))} /></div>
    <div className="jack-row"><Jack moduleId={mod.id} portKey="in" label="IN" direction="in" kind="control" /><Jack moduleId={mod.id} portKey="out" label="OUT" direction="out" kind="control" /></div>
  </div>
)
