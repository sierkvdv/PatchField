import * as Tone from 'tone'
import type { ModuleInstance } from '../ui/store'

export function createOutputRuntime(mod: ModuleInstance) {
  const out = new Tone.Gain(1).toDestination()
  return {
    audio:   { in: out },
    control: { gain: out.gain },
    event:   {}
  }
}
