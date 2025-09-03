import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'

export const filterTemplate = {
  title: 'Filter (VCF)',
  defaults: { type: 'lowpass', frequency: 800, q: 1 },
  ports: [
    { key: 'in', label: 'IN', direction: 'in', kind: 'audio' } as PortSpec,
    { key: 'out', label: 'OUT', direction: 'out', kind: 'audio' } as PortSpec,
    { key: 'cutoffCv', label: 'CUTOFF CV', direction: 'in', kind: 'control' } as PortSpec,
  ],
}

export function createFilterRuntime(mod: ModuleInstance): ModuleRuntime {
  const f = new Tone.Filter({
    frequency: mod.params?.frequency ?? 800,
    type: (mod.params?.type as any) ?? 'lowpass',
    Q: mod.params?.q ?? 1,
    rolloff: -24,
  })
  const input = new Tone.Gain(1)
  const output = new Tone.Gain(1)
  input.connect(f).connect(output)
  return {
    getOut: (k) => (k === 'out' ? output : null),
    getIn: (k) => {
      if (k === 'in') return input
      if (k === 'cutoffCv' || k === 'cutoff' || k === 'frequency') return f.frequency
      if (k === 'q') return f.Q
      return null
    },
    update: (m) => {
      ;(f as any).type = m.params.type
      ;(f.frequency as any).value = m.params.frequency
      ;(f.Q as any).value = m.params.q
    },
    dispose: () => {
      input.dispose()
      output.dispose()
      f.dispose()
    },
  }
}

export const FilterUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="row">
      <div className="select">
        <label>Type</label>
        <select value={mod.params.type} onChange={e => setParam(mod.id, 'type', e.target.value)}>
          {/* Gebruik de Tone.js canonical values */}
          <option value="lowpass">low-pass</option>
          <option value="highpass">high-pass</option>
          <option value="bandpass">band-pass</option>
        </select>
      </div>
      <div className="knob">
        <label>Cutoff (Hz)</label>
        <input
          type="number"
          value={mod.params.frequency}
          min={10}
          max={20000}
          step={1}
          onChange={e => setParam(mod.id, 'frequency', parseFloat(e.target.value))}
        />
      </div>
      <div className="knob">
        <label>Resonance (Q)</label>
        <input
          type="number"
          value={mod.params.q}
          min={0.1}
          max={20}
          step={0.1}
          onChange={e => setParam(mod.id, 'q', parseFloat(e.target.value))}
        />
      </div>
    </div>
    {/* Jacks voor input, output en cutoff‑CV */}
    <Jack mod={mod} portKey="in" />
    <Jack mod={mod} portKey="out" />
    <Jack mod={mod} portKey="cutoffCv" />
  </div>
)
