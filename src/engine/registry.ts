import { createFilterRuntime } from '../modules/filter'
import { createOscRuntime } from '../modules/oscillator'
import { createVcaRuntime } from '../modules/vca'
import { createLfoRuntime } from '../modules/lfo'
import { createDelayRuntime } from '../modules/delay'
import { createOutputRuntime } from '../modules/output'
import type { ModuleInstance } from '../ui/store'

export const moduleRegistry: Record<string, {
  createRuntime: (mod: ModuleInstance)=> any,
  uiPorts: {
    audioIn?: string[]
    audioOut?: string[]
    controlIn?: string[]
    controlOut?: string[]
    eventIn?: string[]
    eventOut?: string[]
  }
}> = {
  Oscillator: {
    createRuntime: createOscRuntime,
    uiPorts: {
      audioIn: [],
      audioOut: ['out'],
      controlIn: ['frequency','detune'],
      controlOut: [],
      eventIn: [],
      eventOut: []
    }
  },
  Filter: {
    createRuntime: createFilterRuntime,
    uiPorts: {
      audioIn: ['in'],
      audioOut: ['out'],
      controlIn: ['frequency','q'],
      controlOut: [],
      eventIn: [],
      eventOut: []
    }
  },
  VCA: {
    createRuntime: createVcaRuntime,
    uiPorts: {
      audioIn: ['in'],
      audioOut: ['out'],
      controlIn: ['gain'],
      controlOut: [],
      eventIn: [],
      eventOut: []
    }
  },
  LFO: {
    createRuntime: createLfoRuntime,
    uiPorts: {
      audioIn: [],
      audioOut: [],
      controlIn: ['frequency','amplitude'],
      controlOut: ['out'],
      eventIn: [],
      eventOut: []
    }
  },
  Delay: {
    createRuntime: createDelayRuntime,
    uiPorts: {
      audioIn: ['in'],
      audioOut: ['out'],
      controlIn: ['delayTime','feedback','wet'],
      controlOut: [],
      eventIn: [],
      eventOut: []
    }
  },
  Output: {
    createRuntime: createOutputRuntime,
    uiPorts: {
      audioIn: ['in'],
      audioOut: [],
      controlIn: ['gain'],
      controlOut: [],
      eventIn: [],
      eventOut: []
    }
  }
}

// Helper for runtime.ts
export function getModuleByIdPublic(id: string) {
  // will be replaced by util.getModuleById to avoid cycle
  return null
}
