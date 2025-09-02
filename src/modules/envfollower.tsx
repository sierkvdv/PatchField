import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'

export const envFollowerTemplate = {
  title: 'Env Follower',
  defaults: { smoothing: 0.8, interval: '16n' },
  ports: [
    { key: 'in', label: 'IN', direction: 'in', kind: 'audio' } as PortSpec,
    { key: 'out', label: 'OUT', direction: 'out', kind: 'control' } as PortSpec,
  ],
}

export function createEnvFollowerRuntime(mod: ModuleInstance): ModuleRuntime {
  // Audio input into a meter, periodically sample level and write to a control Signal
  const input = new Tone.Gain(1)
  const meter = new Tone.Meter({ channels: 1, smoothing: mod.params.smoothing })
  input.connect(meter)
  const out = new Tone.Signal(0)
  const loop = new Tone.Loop(() => {
    const db = meter.getValue() as number // typically -Infinity..0 dB
    const amp = Math.max(0, Tone.dbToGain(db))
    ;(out as any).value = amp
  }, mod.params.interval || '16n')
  loop.start(0)
  return {
    getOut: (k) => (k === 'out' ? (out as unknown as Tone.Signal<any>) : null),
    getIn: (k) => (k === 'in' ? input : null),
    update: (m) => {
      ;(meter as any).smoothing = m.params.smoothing
      ;(loop as any).interval = m.params.interval
    },
    dispose: () => {
      loop.dispose()
      meter.dispose()
      input.dispose()
      out.dispose()
    },
  }
}

export const EnvFollowerUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => (
  <div className="col">
    <div className="row">
      <div className="num"><label>Smoothing</label><input type="number" min={0} max={0.99} step={0.01} value={mod.params.smoothing} onChange={e => setParam(mod.id, 'smoothing', parseFloat(e.target.value))} /></div>
      <div className="select"><label>Interval</label><select value={mod.params.interval} onChange={e => setParam(mod.id, 'interval', e.target.value)}><option>4n</option><option>8n</option><option>16n</option><option>32n</option><option>64n</option></select></div>
    </div>
    <div className="jack-row">
      <Jack moduleId={mod.id} portKey="in" label="IN" direction="in" kind="audio" />
      <Jack moduleId={mod.id} portKey="out" label="ENV (CV)" direction="out" kind="control" />
    </div>
  </div>
)


