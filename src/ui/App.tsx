import React, { useEffect } from 'react'
import * as Tone from 'tone'
import Rack from './Rack'
import { addModule, resetAll, serializePatch, loadPatchFromJSON, loadBasslineDemo, loadLfoDemo, loadFxDemo } from '../patch/store'

const App: React.FC = () => {
  // We voegen niet meer automatisch een Output-module toe bij mount; demo's zorgen zelf voor output.

  // Start alleen het audiosysteem; Tone.Transport.start() wordt later aangeroepen.
  const startAudio = async () => {
    await Tone.start()
  }

  // Helper om audio te starten, demo te laden en vervolgens de transport aan te zetten
  const handleDemo = async (demoFunc: () => void) => {
    await startAudio()
    demoFunc()
    Tone.Transport.start()
  }

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
        <button className="btn" onClick={() => addModule('EnvFollower')}>+ Env Follower</button>
        <button className="btn" onClick={() => addModule('CvToAudio')}>+ CV → Audio</button>
        <button className="btn" onClick={() => addModule('Sequencer16')}>+ Sequencer</button>
        <button className="btn" onClick={() => addModule('GateClock')}>+ Gate/Clock</button>
        <button className="btn" onClick={() => addModule('Oscilloscope')}>+ Oscilloscope</button>
        <button className="btn" onClick={() => addModule('Output')}>+ Output</button>
        <div className="spacer" />
        <button className="btn good" onClick={() => {
          // Start audio and then start the transport; returns a promise so we can chain if needed
          startAudio().then(() => Tone.Transport.start())
        }}>Start Audio</button>
        <button className="btn" onClick={onSave}>Save Patch</button>
        <button className="btn" onClick={onLoad}>Load Patch</button>
        <button className="btn danger" onClick={() => { if (confirm('Clear all modules?')) resetAll() }}>Clear</button>
        {/* Demo-knoppen: starten audio → patch laden → transport starten */}
        <button className="btn" onClick={() => { handleDemo(loadBasslineDemo) }}>Demo: Bassline</button>
        <button className="btn" onClick={() => { handleDemo(loadLfoDemo) }}>Demo: LFO</button>
        <button className="btn" onClick={() => { handleDemo(loadFxDemo) }}>Demo: FX Chain</button>
      </div>
      <Rack />
    </>
  )
}
export default App
