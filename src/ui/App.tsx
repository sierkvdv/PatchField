import React from 'react'
import { useStore } from '../ui/store'
import Rack from './Rack'
import * as Tone from 'tone'

export default function App() {
  const add = useStore(s => s.addModule)
  const loadDemo = useStore(s => s.loadDemo)
  const pending = useStore(s => s.pendingJack)

  return (
    <div>
      <div className="toolbar">
        <button className="btn primary" onClick={async () => { await Tone.start(); alert('Audio started'); }}>Start Audio</button>
        <button className="btn" onClick={() => add('Oscillator')}>+ Oscillator</button>
        <button className="btn" onClick={() => add('Filter')}>+ Filter</button>
        <button className="btn" onClick={() => add('VCA')}>+ VCA</button>
        <button className="btn" onClick={() => add('LFO')}>+ LFO</button>
        <button className="btn" onClick={() => add('Delay')}>+ Delay</button>
        <button className="btn" onClick={() => add('Output')}>+ Output</button>
        <button className="btn" onClick={() => loadDemo()}>Load Demo</button>
        <div className="cable-hud">{pending ? `PATCHING: ${pending.kind}:${pending.portId}` : 'Ready'}</div>
      </div>
      <div className="rack">
        <Rack />
      </div>
    </div>
  )
}
