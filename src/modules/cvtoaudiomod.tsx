import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'

// Simple CV->Audio: a tone generator whose amplitude is driven by the control input
export const cvToAudioTemplate = {
  title: 'CV → Audio Mod',
  defaults: { carrier: 'sine', freq: 220, gainScale: 1 },
  ports: [
    { key: 'cv', label: 'CV IN', direction: 'in', kind: 'control' } as PortSpec,
    { key: 'out', label: 'OUT', direction: 'out', kind: 'audio' } as PortSpec,
  ],
}

export function createCvToAudioRuntime(mod: ModuleInstance): ModuleRuntime {
  const osc = new Tone.Oscillator({ type: mod.params.carrier, frequency: mod.params.freq }).start()
  const vca = new Tone.Gain(0)
  const out = new Tone.Gain(1)
  osc.connect(vca).connect(out)
  // control input scales the VCA gain
  const cvSignal = new Tone.Signal(0)
  cvSignal.connect(vca.gain)
  return {
    getOut: (k) => (k === 'out' ? out : null),
    getIn: (k) => (k === 'cv' ? (cvSignal as unknown as Tone.Signal<any>) : null),
    update: (m) => {
      ;(osc.frequency as any).value = m.params.freq
      ;(osc as any).type = m.params.carrier
    },
    dispose: () => { osc.dispose(); vca.dispose(); out.dispose(); cvSignal.dispose() },
  }
}

export const CvToAudioUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="row">
      <div className="select"><label>Carrier</label><select value={mod.params.carrier} onChange={e => setParam(mod.id, 'carrier', e.target.value)}><option>sine</option><option>triangle</option><option>sawtooth</option><option>square</option></select></div>
      <div className="num"><label>Freq (Hz)</label><input type="number" min={20} max={12000} value={mod.params.freq} onChange={e => setParam(mod.id, 'freq', parseFloat(e.target.value))} /></div>
    </div>
    <div className="jack-row">
      <Jack moduleId={mod.id} portKey="cv" label="CV" direction="in" kind="control" />
      <Jack moduleId={mod.id} portKey="out" label="OUT" direction="out" kind="audio" />
    </div>
  </div>
)


