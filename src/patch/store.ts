import create from 'zustand'
import { nanoid } from '../util/nanoid'
import { ModuleInstance, ModuleType, Connection, PatchJSON } from './types'
import { getModuleTemplate } from '../modules/registry'
import { connect as doConnect, ensureRuntime, disposeRuntime } from './engine'

type PortPos = { x: number, y: number }
type PortGlobalKey = string
function portKey(moduleId: string, port: string) { return `${moduleId}:${port}` }

interface State {
  modules: ModuleInstance[]
  connections: Connection[]
  portPos: Record<PortGlobalKey, PortPos>
  patchFrom?: { moduleId: string, portKey: string, kind: Connection['kind'] }
  mouse?: { x: number, y: number }

  addModule: (type: ModuleType, coords?: Partial<Pick<ModuleInstance, 'x'|'y'>>) => string
  removeModule: (id: string) => void
  moveModule: (id: string, x: number, y: number) => void

  setParam: (id: string, param: string, value: any) => void
  setPortPos: (id: string, port: string, pos: PortPos) => void

  beginPatch: (from: { moduleId: string, portKey: string, kind: Connection['kind'] }) => void
  updateMouse: (x: number, y: number) => void
  tryCompletePatch: (to: { moduleId: string, portKey: string, kind: Connection['kind'] }) => void
  cancelPatch: () => void

  serialize: () => PatchJSON
  load: (json: PatchJSON) => void
  resetAll: () => void
}

export const usePatch = create<State>((set, get) => ({
  modules: [],
  connections: [],
  portPos: {},

  addModule: (type, coords) => {
    const tpl = getModuleTemplate(type)
    const id = nanoid()
    const mod: ModuleInstance = {
      id, type, title: tpl.title,
      x: coords?.x ?? Math.round(40 + Math.random()*200),
      y: coords?.y ?? Math.round(80 + Math.random()*160),
      params: { ...tpl.defaults }, ports: tpl.ports
    }
    set(s => ({ modules: [...s.modules, mod] }))
    const rt = ensureRuntime(mod); rt.update?.(mod)
    return id
  },

  removeModule: (id) => {
    set(s => ({ modules: s.modules.filter(m => m.id !== id), connections: s.connections.filter(c => c.from.moduleId !== id && c.to.moduleId !== id) }))
    disposeRuntime(id)
  },

  moveModule: (id, x, y) => set(s => ({ modules: s.modules.map(m => m.id === id ? { ...m, x, y } : m) })),

  setParam: (id, param, value) => {
    set(s => ({ modules: s.modules.map(m => m.id === id ? { ...m, params: { ...m.params, [param]: value } } : m) }))
    const mod = get().modules.find(m => m.id === id)
    if (mod) { const rt = ensureRuntime(mod); rt.update?.(mod) }
  },

  setPortPos: (id, port, pos) => set(s => ({ portPos: { ...s.portPos, [portKey(id, port)]: pos } })),

  patchFrom: undefined,
  mouse: undefined,
  beginPatch: (from) => set({ patchFrom: from }),
  updateMouse: (x, y) => set({ mouse: { x, y } }),

  tryCompletePatch: (to) => {
    const from = get().patchFrom
    if (!from) return
    function kindsCompatible(a: Connection['kind'], b: Connection['kind']) {
      if (a === b) return true
      const acp = (a === 'control' || a === 'param')
      const bcp = (b === 'control' || b === 'param')
      return (acp && bcp)
    }
    if (!kindsCompatible(from.kind, to.kind)) { set({ patchFrom: undefined }); return }
    const resultKind: Connection['kind'] = (from.kind === 'param' || to.kind === 'param') ? 'param' : from.kind

    const fromMod = get().modules.find(m => m.id === from.moduleId)!
    const toMod = get().modules.find(m => m.id === to.moduleId)!

    // Determine jack directions from module port specs
    const fromSpec = fromMod?.ports?.find(p => p.key === from.portKey)
    const toSpec = toMod?.ports?.find(p => p.key === to.portKey)
    const fromDir = fromSpec?.direction
    const toDir = toSpec?.direction

    // If either port not found, or both ports are inputs or both outputs, cancel
    if (!fromDir || !toDir || fromDir === toDir) { set({ patchFrom: undefined }); return }

    // Ensure connection is always from an output to an input, regardless of click order
    const outEnd = fromDir === 'out' ? { module: fromMod, id: from.moduleId, port: from.portKey } : { module: toMod, id: to.moduleId, port: to.portKey }
    const inEnd  = fromDir === 'out' ? { module: toMod, id: to.moduleId, port: to.portKey }   : { module: fromMod, id: from.moduleId, port: from.portKey }

    const id = nanoid()
    const conn: Connection = {
      id,
      from: { moduleId: outEnd.id, portKey: outEnd.port },
      to: { moduleId: inEnd.id, portKey: inEnd.port },
      kind: resultKind
    }

    const disconnect = doConnect({ module: outEnd.module, portKey: outEnd.port }, { module: inEnd.module, portKey: inEnd.port }, resultKind)
    ;(conn as any).__disconnect = disconnect
    set(s => ({ connections: [...s.connections, conn], patchFrom: undefined }))
  },

  cancelPatch: () => set({ patchFrom: undefined }),

  serialize: () => {
    const { modules, connections } = get()
    return {
      modules: modules.map(m => ({ id: m.id, type: m.type, x: m.x, y: m.y, params: m.params })),
      connections: connections.map(c => ({ from: { id: c.from.moduleId, port: c.from.portKey }, to: { id: c.to.moduleId, port: c.to.portKey }, kind: c.kind }))
    }
  },

  load: (json) => {
    get().modules.forEach(m => disposeRuntime(m.id))
    set({ modules: [], connections: [] })
    for (const m of json.modules) {
      const tpl = getModuleTemplate(m.type)
      const mod: ModuleInstance = { id: m.id, type: m.type, title: tpl.title, x: m.x, y: m.y, params: { ...tpl.defaults, ...m.params }, ports: tpl.ports }
      set(s => ({ modules: [...s.modules, mod] }))
      const rt = ensureRuntime(mod); rt.update?.(mod)
    }
    set(s => {
      const next = [...s.connections]
      for (const c of json.connections) {
        const fromMod = s.modules.find(mm => mm.id === c.from.id)
        const toMod = s.modules.find(mm => mm.id === c.to.id)
        if (!fromMod || !toMod) continue
        const id = nanoid()
        const conn: Connection = { id, from: { moduleId: fromMod.id, portKey: c.from.port }, to: { moduleId: toMod.id, portKey: c.to.port }, kind: c.kind }
        const disconnect = doConnect({ module: fromMod, portKey: c.from.port }, { module: toMod, portKey: c.to.port }, c.kind)
        ;(conn as any).__disconnect = disconnect
        next.push(conn)
      }
      return { connections: next }
    })
  },

  resetAll: () => {
    get().modules.forEach(m => disposeRuntime(m.id))
    set({ modules: [], connections: [], portPos: {}, patchFrom: undefined, mouse: undefined })
  }
}))

export const addModule = (type: ModuleType, coords?: Partial<Pick<ModuleInstance, 'x'|'y'>>) => usePatch.getState().addModule(type, coords)
export const removeModule = (id: string) => usePatch.getState().removeModule(id)
export const moveModule = (id: string, x: number, y: number) => usePatch.getState().moveModule(id, x, y)
export const setParam = (id: string, param: string, value: any) => usePatch.getState().setParam(id, param, value)
export const setPortPos = (id: string, port: string, pos: { x: number, y: number }) => usePatch.getState().setPortPos(id, port, pos)
export const beginPatch = (from: { moduleId: string, portKey: string, kind: Connection['kind'] }) => usePatch.getState().beginPatch(from)
export const updateMouse = (x: number, y: number) => usePatch.getState().updateMouse(x, y)
export const tryCompletePatch = (to: { moduleId: string, portKey: string, kind: Connection['kind'] }) => usePatch.getState().tryCompletePatch(to)
export const cancelPatch = () => usePatch.getState().cancelPatch()
export const serializePatch = () => usePatch.getState().serialize()
export const loadPatchFromJSON = (json: PatchJSON) => usePatch.getState().load(json)
export const resetAll = () => usePatch.getState().resetAll()

export function loadDemoPatch() {
  const idVco = addModule('VCO', { x: 80, y: 120 })
  const idEnv = addModule('ADSR', { x: 380, y: 120 })
  const idVca = addModule('VCA', { x: 680, y: 120 })
  const idFil = addModule('Filter', { x: 680, y: 320 })
  const idLfo = addModule('LFO', { x: 380, y: 320 })
  const idMix = addModule('Mixer4', { x: 900, y: 120 })
  const idDel = addModule('Delay', { x: 900, y: 320 })
  const idRev = addModule('Reverb', { x: 1100, y: 320 })
  const idSeq = addModule('Sequencer16', { x: 80, y: 360 })
  const idGate = addModule('GateClock', { x: 380, y: 520 })
  const idOut = addModule('Output', { x: 1100, y: 120 })

  setTimeout(() => {
    // Audio chain
    beginPatch({ moduleId: idVco, portKey: 'out', kind: 'audio' })
    usePatch.getState().tryCompletePatch({ moduleId: idFil, portKey: 'in', kind: 'audio' })
    beginPatch({ moduleId: idFil, portKey: 'out', kind: 'audio' })
    usePatch.getState().tryCompletePatch({ moduleId: idVca, portKey: 'in', kind: 'audio' })
    beginPatch({ moduleId: idVca, portKey: 'out', kind: 'audio' })
    usePatch.getState().tryCompletePatch({ moduleId: idMix, portKey: 'in1', kind: 'audio' })
    beginPatch({ moduleId: idMix, portKey: 'out', kind: 'audio' })
    usePatch.getState().tryCompletePatch({ moduleId: idDel, portKey: 'in', kind: 'audio' })
    beginPatch({ moduleId: idDel, portKey: 'out', kind: 'audio' })
    usePatch.getState().tryCompletePatch({ moduleId: idRev, portKey: 'in', kind: 'audio' })
    beginPatch({ moduleId: idRev, portKey: 'out', kind: 'audio' })
    usePatch.getState().tryCompletePatch({ moduleId: idOut, portKey: 'in', kind: 'audio' })

    // CV & events
    beginPatch({ moduleId: idEnv, portKey: 'out', kind: 'control' })
    usePatch.getState().tryCompletePatch({ moduleId: idVca, portKey: 'cv', kind: 'control' })

    beginPatch({ moduleId: idLfo, portKey: 'out', kind: 'control' })
    usePatch.getState().tryCompletePatch({ moduleId: idFil, portKey: 'cutoffCv', kind: 'control' })

        // control → control (sequencer CV modulates VCO frequency)
        beginPatch({ moduleId: idSeq, portKey: 'cv', kind: 'control' })
        // The VCO no longer exposes a "freq" parameter port in the UI.
        // Instead it has a control‑rate input named "frequency".
        // Use kind: 'control' here to reflect that this is a control connection.
        usePatch.getState().tryCompletePatch({ moduleId: idVco, portKey: 'frequency', kind: 'control' })

    beginPatch({ moduleId: idSeq, portKey: 'gate', kind: 'event' })
    usePatch.getState().tryCompletePatch({ moduleId: idEnv, portKey: 'trig', kind: 'event' })

    beginPatch({ moduleId: idGate, portKey: 'clockOut', kind: 'event' })
    usePatch.getState().tryCompletePatch({ moduleId: idSeq, portKey: 'clockIn', kind: 'event' })
  }, 60)
}
