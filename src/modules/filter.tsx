
import React from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'
import { setParam } from '../patch/store'

// Helpers: 0..1 ↔ Hz / Q
const FREQ_MIN = 40, FREQ_MAX = 12000;
const Q_MIN = 0.1, Q_MAX = 20;
const clamp01 = (n:number)=>Math.min(Math.max(n,0),1);
const normToFreq = (n:number)=> FREQ_MIN * Math.pow(FREQ_MAX/FREQ_MIN, clamp01(n));
const freqToNorm = (f:number)=> {
  const x = Math.min(Math.max(f, FREQ_MIN), FREQ_MAX);
  return Math.log(x/FREQ_MIN)/Math.log(FREQ_MAX/FREQ_MIN);
};
const normToQ = (n:number)=> Q_MIN + clamp01(n) * (Q_MAX - Q_MIN);
const qToNorm  = (q:number)=> (Math.min(Math.max(q, Q_MIN), Q_MAX) - Q_MIN)/(Q_MAX-Q_MIN);

export const filterTemplate = {
  title: 'Filter (VCF)',
  // envAmt: hoeveel Hz de cutoffCv toevoegt
  defaults: { type: 'lowpass', frequency: 800, q: 1, envAmt: 1800 },
  ports: [
    { key: 'in', label: 'IN', direction: 'in', kind: 'audio' } as PortSpec,
    { key: 'out', label: 'OUT', direction: 'out', kind: 'audio' } as PortSpec,
    { key: 'cutoffCv', label: 'CUTOFF CV', direction: 'in', kind: 'control' } as PortSpec,
  ]
}

export function createFilterRuntime(mod: ModuleInstance): ModuleRuntime {
  // Filter zelf
  const f = new Tone.Filter({
    frequency: (mod.params?.frequency) ?? 800,
    type: (mod.params?.type as any) ?? 'lowpass',
    Q: (mod.params?.q) ?? 1,
    rolloff: -24,
  })
  const input  = new Tone.Gain(1)
  const output = new Tone.Gain(1)
  input.connect(f).connect(output)

  // Base + (CV * Amount) → f.frequency
  // Base cutoff als echte frequency-signal
  const cutoffBase = new Tone.Signal(mod.params?.frequency ?? 800, 'frequency')
  // CV-in (0..1) → Gain(amount in Hz) → som
  const cutoffCvIn = new Tone.Gain(1)
  const cutoffAmt  = new Tone.Gain(mod.params?.envAmt ?? 1800)
  const cutoffSum  = new Tone.Add()
  cutoffBase.connect(cutoffSum)
  cutoffCvIn.connect(cutoffAmt).connect(cutoffSum)
  cutoffSum.connect(f.frequency)
  return {
    // Only the 'out' jack produces audio
    getOut: (k) => (k === 'out' ? output : null),
    // Provide audio in en cutoff CV
    getIn: (k) => {
      if (k === 'in') return input
      // cutoffCv is nu een echte CV-ingang (0..1) die via envAmt in Hz wordt geschaald
      if (k === 'cutoffCv' || k === 'cutoff') return cutoffCvIn
      // 'frequency' direct op de base voor compatibiliteit
      if (k === 'frequency') return cutoffBase
      if (k === 'q') return f.Q
      return null
    },
    // Update internal parameters from module params
    update: (m) => {
      f.type = m.params.type as any
      // Update base cutoff (naar Signal), Q en amount met korte ramps
      try { cutoffBase.rampTo?.(m.params.frequency, 0.01) } catch { (cutoffBase as any).value = m.params.frequency }
      try { (f.Q as any).rampTo?.(m.params.q, 0.01) } catch { (f.Q as any).value = m.params.q }
      try { (cutoffAmt.gain as any).rampTo?.(m.params.envAmt, 0.01) } catch { (cutoffAmt.gain as any).value = m.params.envAmt }
    },
    dispose: () => {
      input.dispose(); output.dispose(); f.dispose();
      cutoffBase.dispose(); cutoffCvIn.dispose(); cutoffAmt.dispose(); cutoffSum.dispose();
    },
  }
}

export const FilterUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => {
  const freqNorm = freqToNorm(mod.params.frequency);
  const qNorm    = qToNorm(mod.params.q);
  return (
    <div className="col">
      <div className="row">
        <div className="select">
          <label>Type</label>
          <select value={mod.params.type} onChange={e => setParam(mod.id, 'type', e.target.value)}>
            <option value="lowpass">low-pass</option>
            <option value="bandpass">band-pass</option>
          </select>
        </div>
        {/* --- Cutoff slider (0–1) met log mapping --- */}
        <div className="slider">
          <label>Cutoff</label>
          <input
            type="range" min={0} max={1} step={0.001}
            value={freqNorm}
            onChange={e => {
              const norm = parseFloat(e.target.value);
              setParam(mod.id, 'frequency', normToFreq(norm));
            }}
          />
          <div className="value">{Math.round(mod.params.frequency)} Hz</div>
        </div>
        {/* --- Resonance slider (0–1) --- */}
        <div className="slider">
          <label>Resonance (Q)</label>
          <input
            type="range" min={0} max={1} step={0.01}
            value={qNorm}
            onChange={e => {
              const norm = parseFloat(e.target.value);
              setParam(mod.id, 'q', normToQ(norm));
            }}
          />
          <div className="value">{mod.params.q.toFixed(1)}</div>
        </div>
        {/* --- Env Amount (Hz) — bepaalt hoeveel cutoffCv bijtelt --- */}
        <div className="slider">
          <label>Env Amount (Hz)</label>
          <input
            type="range" min={0} max={4000} step={10}
            value={mod.params.envAmt}
            onChange={e => setParam(mod.id, 'envAmt', parseFloat(e.target.value))}
          />
          <div className="value">{Math.round(mod.params.envAmt)} Hz</div>
        </div>
      </div>
      <div className="jack-row">
        <Jack moduleId={mod.id} portKey="in"       label="IN"        direction="in"  kind="audio" />
        <Jack moduleId={mod.id} portKey="out"      label="OUT"       direction="out" kind="audio" />
        <Jack moduleId={mod.id} portKey="cutoffCv" label="CUTOFF CV" direction="in"  kind="control" />
      </div>
    </div>
  );
}
