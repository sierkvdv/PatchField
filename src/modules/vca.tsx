import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'

export const vcaTemplate = {
  title: 'VCA',
  // Zet op 1.0 voor direct geluid zonder ADSR; gebruik 0.0 als je “klassiek” wilt.
  defaults: { gain: 1.0 },
  ports: [
    { key: 'in',  label: 'IN',  direction: 'in',  kind: 'audio'   } as PortSpec,
    { key: 'out', label: 'OUT', direction: 'out', kind: 'audio'   } as PortSpec,
    { key: 'cv',  label: 'CV',  direction: 'in',  kind: 'control' } as PortSpec,
  ],
}

export function createVCARuntime(mod: ModuleInstance): ModuleRuntime {
  const g = new Tone.Gain(mod.params?.gain ?? 1.0)   // amplitude
  const input  = new Tone.Gain(1)                    // audio in router
  const output = new Tone.Gain(1)                    // audio out router

  // Audio: IN → Gain → OUT
  input.connect(g).connect(output)

  return {
    getOut: (k) => (k === 'out' ? output : null),
    getIn:  (k) => {
      if (k === 'in') return input
      if (k === 'cv') return g.gain            // CV stuurt de gain-parameter
      return null
    },
    update: (m) => {
      // klikvrije updates
      try { (g.gain as any).rampTo?.(m.params.gain, 0.01) }
      catch { (g.gain as any).value = m.params.gain }
    },
    dispose: () => { input.dispose(); g.dispose(); output.dispose() },
  }
}

export const VCAUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="row">
      <div className="slider">
        <label>Gain</label>
        <input
          type="range" min={0} max={1} step={0.01}
          value={mod.params.gain}
          onChange={e => setParam(mod.id, 'gain', parseFloat(e.target.value))}
        />
        <div className="value">{mod.params.gain.toFixed(2)}</div>
      </div>
    </div>
    <div className="jack-row">
      <Jack moduleId={mod.id} portKey="in"  label="IN"  direction="in"  kind="audio" />
      <Jack moduleId={mod.id} portKey="out" label="OUT" direction="out" kind="audio" />
      <Jack moduleId={mod.id} portKey="cv"  label="CV"  direction="in"  kind="control" />
    </div>
    <div className="hint">ADSR → CV, audio → IN, OUT → Output.</div>
  </div>
)
