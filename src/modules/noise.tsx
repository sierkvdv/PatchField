import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'

export const noiseTemplate = {
  title: 'Noise',
  defaults: { type: 'white' },
  ports: [ { key: 'out', label: 'OUT', direction: 'out', kind: 'audio' } as PortSpec ]
}

export function createNoiseRuntime(mod: ModuleInstance): ModuleRuntime {
  const noise = new Tone.Noise(mod.params.type).start()
  const out = new Tone.Gain(0.7); noise.connect(out)
  return { getOut: (k) => (k === 'out' ? out : null), getIn: () => null, update: (m)=>{ (noise as any).type = m.params.type }, dispose: () => { noise.disconnect(); noise.dispose(); out.dispose() } }
}

export const NoiseUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="select"><label>Type</label>
      <select value={mod.params.type} onChange={e => setParam(mod.id, 'type', e.target.value)}>
        <option value="white">white</option><option value="pink">pink</option><option value="brown">brown</option>
      </select></div>
    <div className="jack-row"><Jack moduleId={mod.id} portKey="out" label="OUT" direction="out" kind="audio" /></div>
  </div>
)
