import React, { useEffect } from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'
import { emitEvent } from '../patch/engine'

function midiToFreq(m: number) { return 440 * Math.pow(2, (m - 69) / 12) }

export const seqTemplate = {
  title: 'Step Sequencer (16)',
  defaults: { steps: Array(16).fill(0), base: 48, subdivision: '16n', playing: true, gateMs: 90 },
  ports: [
    { key: 'cv', label: 'CV OUT', direction: 'out', kind: 'control' } as PortSpec,
    { key: 'gate', label: 'GATE OUT', direction: 'out', kind: 'event' } as PortSpec,
    { key: 'clockIn', label: 'CLOCK IN', direction: 'in', kind: 'event' } as PortSpec,
  ]
}

export function createSeqRuntime(mod: ModuleInstance): ModuleRuntime {
  const cv = new Tone.Signal(0)
  let idx = 0
  const loop = new Tone.Loop(time => {
    const steps: number[] = mod.params.steps || Array(16).fill(0)
    const base: number = mod.params.base || 48
    const note = base + (steps[idx] || 0)
    cv.setValueAtTime(midiToFreq(note), time)
    emitEvent({ moduleId: mod.id, portKey: 'gate' }, { type: 'trigger' })
    idx = (idx + 1) % 16
  }, mod.params.subdivision || '16n')
  if (mod.params.playing) loop.start(0)

  return {
    getOut:(k)=>(k==='cv'?cv:null),
    getIn:()=>null,
    update:(m)=>{ (loop as any).interval = m.params.subdivision; if (m.params.playing) { if (loop.state !== 'started') loop.start(0) } else { loop.stop() } },
    dispose:()=>{ loop.dispose(); cv.dispose() }
  }
}

export const SequencerUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => {
  const steps: number[] = mod.params.steps || Array(16).fill(0)
  const setStep = (i: number, val: number) => { const arr = steps.slice(); arr[i] = val; setParam(mod.id, 'steps', arr) }
  useEffect(() => { Tone.Transport.bpm.value = 120 }, [mod.params.subdivision])
  return (
    <div className="col">
      <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
        {steps.map((v, i) => (
          <div key={i} className="num" style={{ width: 44 }}>
            <label>Step {i+1}</label>
            <input type="number" value={v} onChange={e => setStep(i, parseInt(e.target.value||'0'))} />
          </div>
        ))}
      </div>
      <div className="row">
        <div className="num"><label>Base MIDI</label><input type="number" min={0} max={127} value={mod.params.base} onChange={e => setParam(mod.id, 'base', parseInt(e.target.value))} /></div>
        <div className="select"><label>Subdiv</label><select value={mod.params.subdivision} onChange={e => setParam(mod.id, 'subdivision', e.target.value)}><option>4n</option><option>8n</option><option>16n</option><option>32n</option></select></div>
      </div>
      <div className="row" style={{ gap: 8 }}>
        <button className="btn" onClick={() => setParam(mod.id, 'playing', !mod.params.playing)}>{mod.params.playing ? 'Pause' : 'Play'}</button>
      </div>
      <div className="jack-row">
        <Jack moduleId={mod.id} portKey="cv" label="CV OUT" direction="out" kind="control" />
        <Jack moduleId={mod.id} portKey="gate" label="GATE OUT" direction="out" kind="event" />
        <Jack moduleId={mod.id} portKey="clockIn" label="CLOCK IN" direction="in" kind="event" />
      </div>
    </div>
  )
}
