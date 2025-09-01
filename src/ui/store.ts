import { create } from 'zustand'
import { moduleRegistry } from '../engine/registry'
import { connect } from '../engine/engine'

let idSeq = 1
export type ModuleType = keyof typeof moduleRegistry

export type ModuleInstance = {
  id: string
  type: ModuleType
  x: number
  y: number
  params?: Record<string, any>
}

export type JackRef = {
  moduleId: string
  kind: 'audio'|'control'|'event'
  portId: string
}

type State = {
  modules: ModuleInstance[]
  pendingJack: JackRef | null
  addModule: (type: ModuleType) => void
  moveModule: (id: string, x: number, y: number) => void
  beginPatch: (from: JackRef) => void
  tryCompletePatch: (to: JackRef) => void
  loadDemo: () => void
}

export const useStore = create<State>((set, get) => ({
  modules: [],
  pendingJack: null,
  addModule: (type) => set((s)=>{
    const id = `m${idSeq++}`
    const x = 80 + (s.modules.length%5)*260
    const y = 80 + Math.floor(s.modules.length/5)*220
    return { modules: [...s.modules, { id, type, x, y, params: {} }] }
  }),
  moveModule: (id, x, y) => set((s)=>({ modules: s.modules.map(m => m.id===id? {...m,x,y}:m) })),
  beginPatch: (from) => set({ pendingJack: from }),
  tryCompletePatch: (to) => {
    const from = get().pendingJack
    if (!from) return
    // Only allow same kind for now
    if (from.kind !== to.kind) {
      console.warn('Kinds must match (audio↔audio, control↔control, event↔event)')
      set({ pendingJack: null })
      return
    }
    const ok = connect(from, to)
    if (!ok) console.warn('Connect failed')
    set({ pendingJack: null })
  },
  loadDemo: () => {
    set({ modules: [], pendingJack: null })
    const add = get().addModule
    const all: string[] = []
    add('Oscillator'); all.push('Oscillator')
    add('Filter');     all.push('Filter')
    add('Output');     all.push('Output')
    setTimeout(()=>{
      const m = get().modules
      const osc = m.find(mm=>mm.type==='Oscillator')!
      const fil = m.find(mm=>mm.type==='Filter')!
      const out = m.find(mm=>mm.type==='Output')!
      connect({moduleId:osc.id, kind:'audio', portId:'out'}, {moduleId:fil.id, kind:'audio', portId:'in'})
      connect({moduleId:fil.id,  kind:'audio', portId:'out'}, {moduleId:out.id, kind:'audio', portId:'in'})
    }, 50)
  }
}))
