import * as Tone from 'tone'
import type { ModuleInstance } from '../ui/store'

export function createOscRuntime(mod: ModuleInstance) {
  const osc = new Tone.Oscillator({
    type: (mod.params?.type) ?? 'sawtooth',
    frequency: (mod.params?.frequency) ?? 220,
    detune: (mod.params?.detune) ?? 0
  }).start()

  return {
    audio:   { out: osc },
    control: { frequency: osc.frequency, detune: osc.detune },
    event:   {}
  }
}
