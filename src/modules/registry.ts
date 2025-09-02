import React from 'react'
import { ModuleInstance, ModuleRuntime, ModuleType, PortSpec } from '../patch/types'
import { VCOUI, vcoTemplate, createVCORuntime } from './vco'
import { ADSRUI, adsrTemplate, createADSRRuntime } from './adsr'
import { VCAUI, vcaTemplate, createVCARuntime } from './vca'
import { FilterUI, filterTemplate, createFilterRuntime } from './filter'
import { LFOUI, lfoTemplate, createLFORuntime } from './lfo'
import { MixerUI, mixerTemplate, createMixerRuntime } from './mixer4'
import { NoiseUI, noiseTemplate, createNoiseRuntime } from './noise'
import { DelayUI, delayTemplate, createDelayRuntime } from './delay'
import { ReverbUI, reverbTemplate, createReverbRuntime } from './reverb'
import { MultipleUI, multipleTemplate, createMultipleRuntime } from './multiple'
import { AttenuatorUI, attenTemplate, createAttenRuntime } from './attenuator'
import { SequencerUI, seqTemplate, createSeqRuntime } from './sequencer16'
import { GateClockUI, gateClockTemplate, createGateClockRuntime } from './gateclock'
import { ScopeUI, scopeTemplate, createScopeRuntime } from './oscilloscope'
import { OutputUI, outputTemplate, createOutputRuntime } from './output'
import { EnvFollowerUI, envFollowerTemplate, createEnvFollowerRuntime } from './envfollower'
import { CvToAudioUI, cvToAudioTemplate, createCvToAudioRuntime } from './cvtoaudiomod'

type Tpl = { title: string, defaults: Record<string, any>, ports: PortSpec[] }
const templates: Record<ModuleType, Tpl> = {
  VCO: vcoTemplate, Noise: noiseTemplate, ADSR: adsrTemplate, LFO: lfoTemplate, Filter: filterTemplate,
  VCA: vcaTemplate, Mixer4: mixerTemplate, Multiple: multipleTemplate, Attenuator: attenTemplate,
  Delay: delayTemplate, Reverb: reverbTemplate, GateClock: gateClockTemplate, Sequencer16: seqTemplate,
  Oscilloscope: scopeTemplate, Output: outputTemplate,
  // extra utility modules
  EnvFollower: envFollowerTemplate as any,
  CvToAudio: cvToAudioTemplate as any,
}
const UIs: Record<ModuleType, React.FC<{ mod: ModuleInstance }>> = {
  VCO: VCOUI, Noise: NoiseUI, ADSR: ADSRUI, LFO: LFOUI, Filter: FilterUI, VCA: VCAUI, Mixer4: MixerUI,
  Multiple: MultipleUI, Attenuator: AttenuatorUI, Delay: DelayUI, Reverb: ReverbUI, GateClock: GateClockUI,
  Sequencer16: SequencerUI, Oscilloscope: ScopeUI, Output: OutputUI,
  EnvFollower: EnvFollowerUI as any,
  CvToAudio: CvToAudioUI as any,
}

export function getModuleTemplate(type: ModuleType) { return templates[type] }
export function getModuleUI(type: ModuleType) { return UIs[type] }
export function createRuntimeForModule(mod: ModuleInstance): ModuleRuntime {
  switch (mod.type) {
    case 'VCO': return createVCORuntime(mod)
    case 'Noise': return createNoiseRuntime(mod)
    case 'ADSR': return createADSRRuntime(mod)
    case 'LFO': return createLFORuntime(mod)
    case 'Filter': return createFilterRuntime(mod)
    case 'VCA': return createVCARuntime(mod)
    case 'Mixer4': return createMixerRuntime(mod)
    case 'Multiple': return createMultipleRuntime(mod)
    case 'Attenuator': return createAttenRuntime(mod)
    case 'Delay': return createDelayRuntime(mod)
    case 'Reverb': return createReverbRuntime(mod)
    case 'GateClock': return createGateClockRuntime(mod)
    case 'Sequencer16': return createSeqRuntime(mod)
    case 'Oscilloscope': return createScopeRuntime(mod)
    case 'Output': return createOutputRuntime(mod)
    case 'EnvFollower': return createEnvFollowerRuntime(mod as any)
    case 'CvToAudio': return createCvToAudioRuntime(mod as any)
  }
}
