import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'
import { emitEvent } from '../patch/engine'

export const gateClockTemplate = {
  title: 'Gate / Clock',
  defaults: { bpm: 120, subdiv: '16n', running: true },
  ports: [
    { key: 'gateOut', label: 'GATE OUT', direction: 'out', kind: 'event' } as PortSpec,
    { key: 'trigOut', label: 'TRIG OUT', direction: 'out', kind: 'event' } as PortSpec,
    { key: 'clockOut', label: 'CLOCK OUT', direction: 'out', kind: 'event' } as PortSpec,
  ]
}

export function createGateClockRuntime(mod: ModuleInstance): ModuleRuntime {
  Tone.Transport.bpm.value = mod.params.bpm
  const loop = new Tone.Loop((time) => { emitEvent({ moduleId: mod.id, portKey: 'clockOut' }, { type: 'clock' }) }, mod.params.subdiv || '16n')
  if (mod.params.running) loop.start(0)
  return { getOut:()=>null, getIn:()=>null, update:(m)=>{ Tone.Transport.bpm.value = m.params.bpm; (loop as any).interval = m.params.subdiv; if (m.params.running) { if (loop.state !== 'started') loop.start(0) } else { loop.stop() } }, dispose:()=>{ loop.dispose() } }
}

export const GateClockUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => {
  const emitTrig = () => emitEvent({ moduleId: mod.id, portKey: 'trigOut' }, { type: 'trigger' })
  const downGate = () => emitEvent({ moduleId: mod.id, portKey: 'gateOut' }, { type: 'gate', value: 1 })
  const upGate = () => emitEvent({ moduleId: mod.id, portKey: 'gateOut' }, { type: 'gate', value: 0 })
  return (
    <div className="col">
      <div className="row">
        <div className="num"><label>BPM</label><input type="number" min={30} max={300} value={mod.params.bpm} onChange={e => { setParam(mod.id, 'bpm', parseFloat(e.target.value)); Tone.Transport.bpm.value = parseFloat(e.target.value) }} /></div>
        <div className="select"><label>Subdiv</label><select value={mod.params.subdiv} onChange={e => setParam(mod.id, 'subdiv', e.target.value)}><option>4n</option><option>8n</option><option>16n</option><option>32n</option></select></div>
        <button className="btn" onClick={() => setParam(mod.id, 'running', !mod.params.running)}>{mod.params.running ? 'Stop Clock' : 'Start Clock'}</button>
      </div>
      <div className="row" style={{ gap: 8 }}>
        <button className="btn" onClick={emitTrig}>Trigger</button>
        <button className="btn" onMouseDown={downGate} onMouseUp={upGate}>Gate</button>
      </div>
      <div className="jack-row">
        <Jack moduleId={mod.id} portKey="trigOut" label="TRIG OUT" direction="out" kind="event" />
        <Jack moduleId={mod.id} portKey="gateOut" label="GATE OUT" direction="out" kind="event" />
        <Jack moduleId={mod.id} portKey="clockOut" label="CLOCK OUT" direction="out" kind="event" />
      </div>
    </div>
  )
}
