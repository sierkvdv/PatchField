import * as Tone from 'tone'
import type { ModuleInstance } from '../ui/store'

export function createFilterRuntime(mod: ModuleInstance) {
  const f = new Tone.Filter({
    frequency: (mod.params?.frequency) ?? 800,
    type: (mod.params?.type as any) ?? 'lowpass',
    Q: (mod.params?.q) ?? 1,
    rolloff: (mod.params?.rolloff) ?? -24 // -12,-24,-48,-96
  })

  return {
    audio:   { in: f, out: f },
    control: {
      frequency: f.frequency,
      cutoff: f.frequency, // alias for UI
      q: f.Q
    },
    event:   {}
  }
}
