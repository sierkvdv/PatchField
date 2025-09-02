import * as Tone from 'tone'

// Extend SignalKind to include 'event'.  Some modules expose ports
// marked as kind 'event' to handle arbitrary trigger/gate/clock events.
export type SignalKind = 'audio' | 'control' | 'param' | 'trigger' | 'gate' | 'clock' | 'event'

export interface PortSpec {
  key: string
  label: string
  direction: 'in' | 'out'
  kind: SignalKind
}

export type ModuleType =
  | 'VCO' | 'Noise' | 'ADSR' | 'LFO' | 'Filter' | 'VCA' | 'Mixer4'
  | 'Multiple' | 'Attenuator' | 'Delay' | 'Reverb' | 'GateClock'
  | 'Sequencer16' | 'Oscilloscope' | 'Output' | 'EnvFollower' | 'CvToAudio'

export interface ModuleInstance {
  id: string
  type: ModuleType
  title: string
  x: number
  y: number
  params: Record<string, any>
  ports: PortSpec[]
}

export interface Connection {
  id: string
  from: { moduleId: string, portKey: string }
  to: { moduleId: string, portKey: string }
  kind: 'audio' | 'control' | 'param' | 'event'
}

export type PortRuntimeTarget = Tone.ToneAudioNode | Tone.Signal<any> | Tone.Param<any> | AudioNode | null

export interface ModuleRuntime {
  getOut(portKey: string): PortRuntimeTarget
  getIn(portKey: string): PortRuntimeTarget
  onEvent?(portKey: string, ev: { type: 'trigger' | 'gate' | 'clock', value?: number }): void
  update?(mod: ModuleInstance): void
  dispose(): void
}

export interface PatchJSON {
  modules: Array<{ id: string, type: ModuleType, x: number, y: number, params: Record<string, any> }>
  connections: Array<{ from: { id: string, port: string }, to: { id: string, port: string }, kind: 'audio'|'control'|'param'|'event' }>
}
