import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'

export const vcoTemplate = {
  title: 'Oscillator (VCO)',
  defaults: { waveform: 'sawtooth', frequency: 110, detune: 0, volume: -8 },
  // Define one audio output and a control input for frequency.  Using
  // kind="control" here instead of "param" means this port accepts
  // control‑rate signals (e.g. from an LFO or sequencer).  The old
  // 'freq' port is still supported in the runtime for backwards
  // compatibility.
  ports: [
    { key: 'out', label: 'OUT', direction: 'out', kind: 'audio' } as PortSpec,
    { key: 'frequency', label: 'FREQ (Hz)', direction: 'in', kind: 'control' } as PortSpec,
  ],
}

export function createVCORuntime(mod: ModuleInstance): ModuleRuntime {
  // Construct the Tone oscillator with the initial parameters.  The
  // "frequency" parameter here is the pitch of the oscillator, which can
  // later be modulated via the control input.  "volume" is used
  // instead of "amplitude" because Tone.js oscillators expose volume in
  // decibels.
  const osc = new Tone.Oscillator({
    type: mod.params.waveform,
    frequency: mod.params.frequency,
    detune: mod.params.detune,
    volume: mod.params.volume,
  }).start()
  const out = new Tone.Gain(1)
  osc.connect(out)
  return {
    // Provide a single audio output.  Consumers should connect to
    // `out` to get the oscillator's audio.
    getOut: (k) => (k === 'out' ? out : null),
    // Provide a control‑rate input for frequency modulation.  Accept
    // either "frequency" (the new port) or "freq" (for backwards
    // compatibility) and route the control signal to the oscillator's
    // frequency parameter.  Tone.js exposes oscillator.frequency as a
    // signal that supports connect() from LFOs and envelopes.
    getIn: (k) => {
      if (k === 'frequency' || k === 'freq') return osc.frequency
      return null
    },
    // When parameters change in the module state, update the Tone
    // oscillator accordingly.  We don't update volume here because
    // volume typically controls the amplitude in decibels and is
    // intended to be static for this module.
    update: (m) => {
      osc.type = m.params.waveform
      ;(osc.frequency as any).value = m.params.frequency
      ;(osc.detune as any).value = m.params.detune
    },
    dispose: () => {
      osc.disconnect()
      osc.dispose()
      out.dispose()
    },
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
        <input type="number" min={20} max={20000} step={1} value={mod.params.frequency} onChange={e => setParam(mod.id, 'frequency', parseFloat(e.target.value))} /></div>
      <div className="num"><label>Detune (cents)</label>
        <input type="number" min={-1200} max={1200} step={1} value={mod.params.detune} onChange={e => setParam(mod.id, 'detune', parseFloat(e.target.value))} /></div>
    </div>
    <div className="jack-row">
      <Jack moduleId={mod.id} portKey="out" label="OUT" direction="out" kind="audio" />
      <Jack moduleId={mod.id} portKey="frequency" label="FREQ CV" direction="in" kind="control" />
    </div>
    <p className="muted">Tip: Patch Sequencer → VCO FREQ voor noten.</p>
  </div>
)
