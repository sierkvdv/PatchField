import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'

export const lfoTemplate = {
  title: 'LFO',
  defaults: { waveform: 'sine', frequency: 2, amplitude: 1, offset: 0 },
  ports: [ { key: 'out', label: 'OUT', direction: 'out', kind: 'control' } as PortSpec ]
}

export function createLFORuntime(mod: ModuleInstance): ModuleRuntime {
  const lfo = new Tone.LFO({ type: mod.params.waveform, frequency: mod.params.frequency, min: -mod.params.amplitude + mod.params.offset, max: mod.params.amplitude + mod.params.offset }).start()
  const out = lfo as unknown as Tone.Signal<any>
  return { getOut:(k)=>(k==='out'?out:null), getIn:()=>null, update:(m)=>{ lfo.type = m.params.waveform; (lfo.frequency as any).value = m.params.frequency; lfo.min = -m.params.amplitude + m.params.offset; lfo.max = m.params.amplitude + m.params.offset }, dispose:()=>{ lfo.dispose() } }
}

export const LFOUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="row">
      <div className="select"><label>Waveform</label><select value={mod.params.waveform} onChange={e => setParam(mod.id, 'waveform', e.target.value)}><option>sine</option><option>square</option><option>triangle</option><option>sawtooth</option></select></div>
      <div className="num"><label>Rate (Hz)</label><input type="number" min={0.01} step={0.01} value={mod.params.frequency} onChange={e => setParam(mod.id, 'frequency', parseFloat(e.target.value))} /></div>
      <div className="num"><label>Amplitude</label><input type="number" min={0} step={0.01} value={mod.params.amplitude} onChange={e => setParam(mod.id, 'amplitude', parseFloat(e.target.value))} /></div>
      <div className="num"><label>Offset</label><input type="number" step={0.01} value={mod.params.offset} onChange={e => setParam(mod.id, 'offset', parseFloat(e.target.value))} /></div>
    </div>
    <div className="jack-row"><Jack moduleId={mod.id} portKey="out" label="OUT" direction="out" kind="control" /></div>
  </div>
)
