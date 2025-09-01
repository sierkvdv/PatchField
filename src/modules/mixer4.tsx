import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'

export const mixerTemplate = {
  title: 'Mixer (4ch)',
  defaults: { ch1: 0.7, ch2: 0.7, ch3: 0.7, ch4: 0.7 },
  ports: [
    { key: 'in1', label: 'CH1 IN', direction: 'in', kind: 'audio' } as PortSpec,
    { key: 'in2', label: 'CH2 IN', direction: 'in', kind: 'audio' } as PortSpec,
    { key: 'in3', label: 'CH3 IN', direction: 'in', kind: 'audio' } as PortSpec,
    { key: 'in4', label: 'CH4 IN', direction: 'in', kind: 'audio' } as PortSpec,
    { key: 'out', label: 'OUT', direction: 'out', kind: 'audio' } as PortSpec,
  ]
}

export function createMixerRuntime(mod: ModuleInstance): ModuleRuntime {
  const g1 = new Tone.Gain(mod.params.ch1), g2 = new Tone.Gain(mod.params.ch2), g3 = new Tone.Gain(mod.params.ch3), g4 = new Tone.Gain(mod.params.ch4)
  const out = new Tone.Gain(1); g1.connect(out); g2.connect(out); g3.connect(out); g4.connect(out)
  return {
    getOut:(k)=>(k==='out'?out:null),
    getIn:(k)=>{ if (k==='in1') return g1; if (k==='in2') return g2; if (k==='in3') return g3; if (k==='in4') return g4; return null },
    update:(m)=>{ (g1.gain as any).value = m.params.ch1; (g2.gain as any).value = m.params.ch2; (g3.gain as any).value = m.params.ch3; (g4.gain as any).value = m.params.ch4 },
    dispose:()=>{ g1.dispose(); g2.dispose(); g3.dispose(); g4.dispose(); out.dispose() }
  }
}

export const MixerUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="row">
      <div className="slider"><label>CH1 {mod.params.ch1.toFixed(2)}</label><input type="range" min={0} max={1} step={0.01} value={mod.params.ch1} onChange={e => setParam(mod.id, 'ch1', parseFloat(e.target.value))}/></div>
      <div className="slider"><label>CH2 {mod.params.ch2.toFixed(2)}</label><input type="range" min={0} max={1} step={0.01} value={mod.params.ch2} onChange={e => setParam(mod.id, 'ch2', parseFloat(e.target.value))}/></div>
      <div className="slider"><label>CH3 {mod.params.ch3.toFixed(2)}</label><input type="range" min={0} max={1} step={0.01} value={mod.params.ch3} onChange={e => setParam(mod.id, 'ch3', parseFloat(e.target.value))}/></div>
      <div className="slider"><label>CH4 {mod.params.ch4.toFixed(2)}</label><input type="range" min={0} max={1} step={0.01} value={mod.params.ch4} onChange={e => setParam(mod.id, 'ch4', parseFloat(e.target.value))}/></div>
    </div>
    <div className="jack-row">
      <Jack moduleId={mod.id} portKey="in1" label="CH1" direction="in" kind="audio" />
      <Jack moduleId={mod.id} portKey="in2" label="CH2" direction="in" kind="audio" />
      <Jack moduleId={mod.id} portKey="in3" label="CH3" direction="in" kind="audio" />
      <Jack moduleId={mod.id} portKey="in4" label="CH4" direction="in" kind="audio" />
      <Jack moduleId={mod.id} portKey="out" label="OUT" direction="out" kind="audio" />
    </div>
  </div>
)
