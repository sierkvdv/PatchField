import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'

export const vcoTemplate = {
  title: 'Oscillator (VCO)',
  defaults: { waveform: 'sawtooth', frequency: 110, detune: 0, volume: -8 },
  ports: [
    { key: 'out', label: 'OUT', direction: 'out', kind: 'audio' } as PortSpec,
    // Gebruik 'frequency' als control‑input voor CV modulatie.
    // De oude 'freq' input met kind 'param' veroorzaakte verbindingsproblemen.
    { key: 'frequency', label: 'FREQ (Hz)', direction: 'in', kind: 'control' } as PortSpec,
  ]
}

export function createVCORuntime(mod: ModuleInstance): ModuleRuntime {
  const osc = new Tone.Oscillator({
    type: mod.params.waveform,
    frequency: mod.params.frequency,
    detune: mod.params.detune,
    volume: mod.params.volume
  }).start()
  const out = new Tone.Gain(1)
  osc.connect(out)
  return {
    getOut: (k) => (k === 'out' ? out : null),
    // Sta zowel 'frequency' als de legacy 'freq' toe om bestaande patches niet te breken.
    getIn: (k) => {
      if (k === 'frequency' || k === 'freq') return osc.frequency
      return null
    },
    update: (m) => {
      osc.type = m.params.waveform
      ;(osc.frequency as any).value = m.params.frequency
      ;(osc.detune as any).value = m.params.detune
    },
    dispose: () => {
      osc.disconnect()
      osc.dispose()
      out.dispose()
    }
  }
}

export const VCOUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="row">
      <div className="select"><label>Waveform</label>
        <select value={mod.params.waveform} onChange={e => setParam(mod.id, 'waveform', e.target.value)}>
          <option>sine</option><option>square</option><option>triangle</option><option>sawtooth</option>
        </select>
      </div>
      <div className="num"><label>Frequency (Hz)</label>
        <input type="number" min={20} max={20000} step={1} value={mod.params.frequency} onChange={e => setParam(mod.id, 'frequency', parseFloat(e.target.value))} />
      </div>
      <div className="num"><label>Detune (cents)</label>
        <input type="number" min={-1200} max={1200} step={1} value={mod.params.detune} onChange={e => setParam(mod.id, 'detune', parseFloat(e.target.value))} />
      </div>
    </div>
    <div className="jack-row">
      <Jack moduleId={mod.id} portKey="out" label="OUT" direction="out" kind="audio" />
      <Jack moduleId={mod.id} portKey="frequency" label="FREQ CV" direction="in" kind="control" />
    </div>
    <p className="muted">Tip: Patch Sequencer → VCO FREQ voor noten.</p>
  </div>
)
