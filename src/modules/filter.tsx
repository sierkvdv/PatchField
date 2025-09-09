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
  ]
}

export function createFilterRuntime(mod: ModuleInstance): ModuleRuntime {
  // Use the options-object form of Tone.Filter. The positional arguments
  // (frequency, type, Q) are deprecated and treat the third argument as
  // rolloff, causing "rolloff can only be -12,-24,-48,-96" errors. By
  // passing an object we set frequency, type and Q explicitly and choose
  // a default rolloff of -24 dB/oct.
  const f = new Tone.Filter({
    frequency: (mod.params?.frequency) ?? 800,
    type: (mod.params?.type as any) ?? 'lowpass',
    Q: (mod.params?.q) ?? 1,
    rolloff: -24,
  })
  const input = new Tone.Gain(1)
  const output = new Tone.Gain(1)
  // connect input -> filter -> output
  input.connect(f).connect(output)
  return {
    // Only the 'out' jack produces audio
    getOut: (k) => (k === 'out' ? output : null),
    // Provide audio in and cutoff CV. Use frequency alias for cutoffCv.
    getIn: (k) => {
      if (k === 'in') return input
      if (k === 'cutoffCv' || k === 'cutoff' || k === 'frequency') return f.frequency
      if (k === 'q') return f.Q
      return null
    },
    // Update internal parameters from module params
    update: (m) => {
      // Set parameters explicitly; use short ramps for audible, click-free updates
      f.type = m.params.type as any
      try { (f.frequency as any).rampTo?.(m.params.frequency, 0.01) } catch { (f.frequency as any).value = m.params.frequency }
      try { (f.Q as any).rampTo?.(m.params.q, 0.01) } catch { (f.Q as any).value = m.params.q }
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
      <div className="select"><label>Type</label>
        <select value={mod.params.type} onChange={e => setParam(mod.id, 'type', e.target.value)}>
          <option value="lowpass">low-pass</option><option value="bandpass">band-pass</option>
        </select></div>
      <div className="num">
        <label>Cutoff (Hz)</label>
        <input
          type="number"
          min={40}
          max={12000}
          step={1}
          value={mod.params.frequency}
          onChange={e => {
            const val = parseFloat(e.target.value);
            // Only update the parameter if the number is valid
            if (!Number.isNaN(val)) {
              setParam(mod.id, 'frequency', val);
            }
          }}
        />
      </div>
      <div className="num">
        <label>Resonance (Q)</label>
        <input
          type="number"
          min={0.1}
          max={20}
          step={0.1}
          value={mod.params.q}
          onChange={e => {
            const val = parseFloat(e.target.value);
            // Only update Q when the value is a valid number
            if (!Number.isNaN(val)) {
              setParam(mod.id, 'q', val);
            }
          }}
        />
      </div>
    </div>
    <div className="jack-row">
      <Jack moduleId={mod.id} portKey="in" label="IN" direction="in" kind="audio" />
      <Jack moduleId={mod.id} portKey="out" label="OUT" direction="out" kind="audio" />
      <Jack moduleId={mod.id} portKey="cutoffCv" label="CUTOFF CV" direction="in" kind="control" />
    </div>
  </div>
)
