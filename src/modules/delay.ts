import * as Tone from 'tone'
import type { ModuleInstance } from '../ui/store'

export function createDelayRuntime(mod: ModuleInstance) {
  const fx = new Tone.FeedbackDelay({
    delayTime: (mod.params?.delayTime) ?? 0.25,
    feedback:  (mod.params?.feedback)  ?? 0.3,
    wet:       (mod.params?.wet)       ?? 0.2
  })
  return {
    audio:   { in: fx, out: fx },
    control: { delayTime: fx.delayTime, feedback: fx.feedback, wet: fx.wet },
    event:   {}
  }
}
