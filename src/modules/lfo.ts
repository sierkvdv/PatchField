import * as Tone from 'tone'
import type { ModuleInstance } from '../ui/store'

export function createLfoRuntime(mod: ModuleInstance) {
  const lfo = new Tone.LFO({
    frequency: (mod.params?.frequency) ?? 5,
    amplitude: (mod.params?.amplitude) ?? 1,
    min: -1, max: 1
  }).start()

  return {
    audio:   {},
    control: { frequency: lfo.frequency, amplitude: lfo.amplitude, out: lfo },
    event:   {}
  }
}
