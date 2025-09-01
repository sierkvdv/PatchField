import * as Tone from 'tone'
import type { ModuleInstance } from '../ui/store'

export function createVcaRuntime(mod: ModuleInstance) {
  const v = new Tone.Gain((mod.params?.gain) ?? 0.8)
  return {
    audio:   { in: v, out: v },
    control: { gain: v.gain },
    event:   {}
  }
}
