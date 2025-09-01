import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'

export const reverbTemplate = {
  title: 'Reverb',
  defaults: { decay: 2.8, wet: 0.25 },
  ports: [ { key: 'in', label: 'IN', direction: 'in', kind: 'audio' } as PortSpec, { key: 'out', label: 'OUT', direction: 'out', kind: 'audio' } as PortSpec ]
}

export function createReverbRuntime(mod: ModuleInstance): ModuleRuntime {
  const fx = new Tone.Reverb({ decay: mod.params.decay, wet: mod.params.wet })
  return { getOut:(k)=>(k==='out'?fx:null), getIn:(k)=>(k==='in'?fx:null), update:(m)=>{ (fx as any).decay = m.params.decay; (fx.wet as any).value = m.params.wet }, dispose:()=>{ fx.dispose() } }
}

export const ReverbUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="row">
      <div className="num"><label>Decay (s)</label><input type="number" min={0.1} step={0.1} value={mod.params.decay} onChange={e => setParam(mod.id, 'decay', parseFloat(e.target.value))} /></div>
      <div className="num"><label>Wet</label><input type="number" min={0} max={1} step={0.01} value={mod.params.wet} onChange={e => setParam(mod.id, 'wet', parseFloat(e.target.value))} /></div>
    </div>
    <div className="jack-row"><Jack moduleId={mod.id} portKey="in" label="IN" direction="in" kind="audio" /><Jack moduleId={mod.id} portKey="out" label="OUT" direction="out" kind="audio" /></div>
  </div>
)
