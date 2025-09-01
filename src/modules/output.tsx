import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'

export const outputTemplate = {
  title: 'Output / Master',
  defaults: { volume: -6 },
  ports: [ { key: 'in', label: 'IN', direction: 'in', kind: 'audio' } as PortSpec ]
}

export function createOutputRuntime(mod: ModuleInstance): ModuleRuntime {
  const gain = new Tone.Gain(1).connect(Tone.Destination)
  Tone.Destination.volume.value = mod.params.volume
  return { getOut:()=>null, getIn:(k)=>(k==='in'?gain:null), update:(m)=>{ Tone.Destination.volume.value = m.params.volume }, dispose:()=>{ gain.dispose() } }
}

export const OutputUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="num"><label>Master Volume (dB)</label><input type="number" min={-60} max={6} step={0.5} value={mod.params.volume} onChange={e => { setParam(mod.id, 'volume', parseFloat(e.target.value)); Tone.Destination.volume.value = parseFloat(e.target.value) }} /></div>
    <div className="jack-row"><Jack moduleId={mod.id} portKey="in" label="IN" direction="in" kind="audio" /></div>
    <p className="muted">Connect your final signal here.</p>
  </div>
)
