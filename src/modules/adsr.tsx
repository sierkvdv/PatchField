import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'
import { emitEvent } from '../patch/engine'

export const adsrTemplate = {
  title: 'ADSR Envelope',
  defaults: { attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.4 },
  ports: [
    { key: 'out', label: 'ENV OUT', direction: 'out', kind: 'control' } as PortSpec,
    { key: 'trig', label: 'TRIG', direction: 'in', kind: 'event' } as PortSpec,
    { key: 'gate', label: 'GATE', direction: 'in', kind: 'event' } as PortSpec,
  ]
}

export function createADSRRuntime(mod: ModuleInstance): ModuleRuntime {
  const env = new Tone.Envelope({ attack: mod.params.attack, decay: mod.params.decay, sustain: mod.params.sustain, release: mod.params.release })
  const out = env as unknown as Tone.Signal<any>
  return {
    getOut: (k) => (k === 'out' ? out : null),
    getIn: () => null,
    onEvent: (portKey, ev) => {
      if (portKey === 'trig' && ev.type === 'trigger') env.triggerAttackRelease('8n')
      if (portKey === 'gate') {
        if (ev.type === 'gate' && ev.value === 1) env.triggerAttack()
        if (ev.type === 'gate' && ev.value === 0) env.triggerRelease()
      }
    },
    update: (m) => { env.attack = m.params.attack; env.decay = m.params.decay; env.sustain = m.params.sustain; env.release = m.params.release },
    dispose: () => { env.dispose() }
  }
}

export const ADSRUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="row">
      <div className="slider"><label>A: {mod.params.attack.toFixed(2)}s</label><input type="range" min={0.001} max={2} step={0.001} value={mod.params.attack} onChange={e => setParam(mod.id, 'attack', parseFloat(e.target.value))} /></div>
      <div className="slider"><label>D: {mod.params.decay.toFixed(2)}s</label><input type="range" min={0.001} max={2} step={0.001} value={mod.params.decay} onChange={e => setParam(mod.id, 'decay', parseFloat(e.target.value))} /></div>
      <div className="slider"><label>S: {mod.params.sustain.toFixed(2)}</label><input type="range" min={0} max={1} step={0.01} value={mod.params.sustain} onChange={e => setParam(mod.id, 'sustain', parseFloat(e.target.value))} /></div>
      <div className="slider"><label>R: {mod.params.release.toFixed(2)}s</label><input type="range" min={0.001} max={3} step={0.001} value={mod.params.release} onChange={e => setParam(mod.id, 'release', parseFloat(e.target.value))} /></div>
    </div>
    <div className="row" style={{ gap: 8 }}>
      <button className="btn" onClick={() => emitEvent({ moduleId: mod.id, portKey: 'trig' }, { type: 'trigger' })}>Trigger</button>
      <button className="btn" onMouseDown={() => emitEvent({ moduleId: mod.id, portKey: 'gate' }, { type: 'gate', value: 1 })} onMouseUp={() => emitEvent({ moduleId: mod.id, portKey: 'gate' }, { type: 'gate', value: 0 })}>Gate</button>
    </div>
    <div className="jack-row">
      <Jack moduleId={mod.id} portKey="out" label="ENV OUT" direction="out" kind="control" />
      <Jack moduleId={mod.id} portKey="trig" label="TRIG" direction="in" kind="event" />
      <Jack moduleId={mod.id} portKey="gate" label="GATE" direction="in" kind="event" />
    </div>
    <p className="muted">Patch ENV OUT → VCA CV (gain).</p>
  </div>
)
