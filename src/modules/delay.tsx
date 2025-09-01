import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'

export const delayTemplate = {
  title: 'Delay',
  defaults: { time: 0.3, feedback: 0.35, wet: 0.3 },
  ports: [ { key: 'in', label: 'IN', direction: 'in', kind: 'audio' } as PortSpec, { key: 'out', label: 'OUT', direction: 'out', kind: 'audio' } as PortSpec ]
}

export function createDelayRuntime(mod: ModuleInstance): ModuleRuntime {
  const fx = new Tone.FeedbackDelay(mod.params.time, mod.params.feedback); fx.wet.value = mod.params.wet
  return { getOut:(k)=>(k==='out'?fx:null), getIn:(k)=>(k==='in'?fx:null), update:(m)=>{ (fx.delayTime as any).value = m.params.time; (fx.feedback as any).value = m.params.feedback; (fx.wet as any).value = m.params.wet }, dispose:()=>{ fx.dispose() } }
}

export const DelayUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="row">
      <div className="num"><label>Time (s)</label><input type="number" min={0} step={0.01} value={mod.params.time} onChange={e => setParam(mod.id, 'time', parseFloat(e.target.value))} /></div>
      <div className="num"><label>Feedback</label><input type="number" min={0} max={0.95} step={0.01} value={mod.params.feedback} onChange={e => setParam(mod.id, 'feedback', parseFloat(e.target.value))} /></div>
      <div className="num"><label>Wet</label><input type="number" min={0} max={1} step={0.01} value={mod.params.wet} onChange={e => setParam(mod.id, 'wet', parseFloat(e.target.value))} /></div>
    </div>
    <div className="jack-row"><Jack moduleId={mod.id} portKey="in" label="IN" direction="in" kind="audio" /><Jack moduleId={mod.id} portKey="out" label="OUT" direction="out" kind="audio" /></div>
  </div>
)
