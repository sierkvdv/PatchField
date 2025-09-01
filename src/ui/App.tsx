import React, { useEffect } from 'react'
import * as Tone from 'tone'
import Rack from './Rack'
import { addModule, resetAll, serializePatch, loadPatchFromJSON, loadDemoPatch } from '../patch/store'

const App: React.FC = () => {
  useEffect(() => {
    // Zorg dat er een Output is
    addModule('Output', { x: 1100, y: 120 })
  }, [])

  const startAudio = async () => { await Tone.start(); Tone.Transport.start() }

  const onSave = () => {
    const data = serializePatch()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `patch-${new Date().toISOString().replace(/[:.]/g,'-')}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const onLoad = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'application/json'
    input.onchange = async () => {
      if (!input.files?.[0]) return
      const json = JSON.parse(await input.files[0].text())
      loadPatchFromJSON(json)
    }
    input.click()
  }

  return (
    <>
      <div className="toolbar">
        <div className="title">🔌 Modular Synth (React + Tone.js)</div>
        <button className="btn" onClick={() => addModule('VCO')}>+ VCO</button>
        <button className="btn" onClick={() => addModule('ADSR')}>+ ADSR</button>
        <button className="btn" onClick={() => addModule('VCA')}>+ VCA</button>
        <button className="btn" onClick={() => addModule('Filter')}>+ Filter</button>
        <button className="btn" onClick={() => addModule('LFO')}>+ LFO</button>
        <button className="btn" onClick={() => addModule('Mixer4')}>+ Mixer (4ch)</button>
        <button className="btn" onClick={() => addModule('Noise')}>+ Noise</button>
        <button className="btn" onClick={() => addModule('Delay')}>+ Delay</button>
        <button className="btn" onClick={() => addModule('Reverb')}>+ Reverb</button>
        <button className="btn" onClick={() => addModule('Multiple')}>+ Multiple</button>
        <button className="btn" onClick={() => addModule('Attenuator')}>+ Attenuator</button>
        <button className="btn" onClick={() => addModule('Sequencer16')}>+ Sequencer</button>
        <button className="btn" onClick={() => addModule('GateClock')}>+ Gate/Clock</button>
        <button className="btn" onClick={() => addModule('Oscilloscope')}>+ Oscilloscope</button>
        <div className="spacer" />
        <button className="btn good" onClick={startAudio}>Start Audio</button>
        <button className="btn" onClick={onSave}>Save Patch</button>
        <button className="btn" onClick={onLoad}>Load Patch</button>
        <button className="btn danger" onClick={() => { if (confirm('Clear all modules?')) resetAll() }}>Clear</button>
        <button className="btn" onClick={() => loadDemoPatch()}>Load Demo</button>
      </div>
      <div className="rack"><Rack /></div>
    </>
  )
}
export default App
