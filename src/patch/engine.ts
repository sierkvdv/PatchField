import * as Tone from 'tone'
import { ModuleInstance, ModuleRuntime, Connection, PortRuntimeTarget } from './types'
import { createRuntimeForModule } from '../modules/registry'

type PortKey = string
type ModuleId = string
interface RouterKey { moduleId: ModuleId, portKey: PortKey }

const outRouters = new Map<string, Tone.Gain>()
export const runtimes = new Map<ModuleId, ModuleRuntime>()
function routerKey(k: RouterKey) { return `${k.moduleId}:${k.portKey}` }

const eventRoutes = new Map<string, Array<{ moduleId: ModuleId, portKey: PortKey }>>()

export function ensureRuntime(mod: ModuleInstance): ModuleRuntime {
  let r = runtimes.get(mod.id)
  if (!r) { r = createRuntimeForModule(mod); runtimes.set(mod.id, r) }
  return r
}
export function disposeRuntime(id: ModuleId) {
  const r = runtimes.get(id)
  if (r) r.dispose()
  runtimes.delete(id)
  for (const [k, list] of eventRoutes.entries()) {
    const filtered = list.filter(t => t.moduleId !== id)
    if (filtered.length === 0) eventRoutes.delete(k)
    else eventRoutes.set(k, filtered)
  }
  for (const [k, g] of outRouters.entries()) {
    if (k.startsWith(id + ':')) { g.disconnect(); g.dispose(); outRouters.delete(k) }
  }
}
export function getRuntime(id: string): ModuleRuntime | undefined { return runtimes.get(id) }

function getRouter(src: RouterKey, sourceNode: PortRuntimeTarget): Tone.Gain {
  const k = routerKey(src)
  let g = outRouters.get(k)
  if (!g) {
    g = new Tone.Gain(1).toDestination()
    g.disconnect()
    outRouters.set(k, g)
    if (sourceNode && 'connect' in (sourceNode as any)) { (sourceNode as any).connect(g) }
  }
  return g
}

// Normalize a port name to a canonical name. This allows UI port keys like
// "freq" or "cutoff" to map to the runtime's expected port names. Only
// aliases that differ from the canonical names need to be specified here.
function normalizePortName(port: string): string {
  // Convert to lowercase and strip whitespace and parentheses
  const raw = String(port || '')
  const key = raw.toLowerCase().replace(/[\s\(\)]+/g, '')
  // Handle known aliases.  Note: only aliases that differ from the
  // canonical port names need to be specified.  Most port names can
  // be returned as-is after cleanup.
  switch (key) {
    // VCO frequency aliases
    case 'freq':
      return 'frequency'
    // Accept "freqcv" (e.g. "FREQ CV") as an alias for the frequency control
    case 'freqcv':
      return 'frequency'
    // Filter cutoff aliases
    case 'cutoff':
      return 'cutoffCv'
    case 'cutoffcv':
      return 'cutoffCv'
    // Parameter alias for resonance
    case 'res':
    case 'resonance':
      return 'q'
    // VCA and other CV aliases
    case 'gain':
    case 'amp':
    case 'cvgain':
      return 'cv'
    // Mixer channel aliases
    case 'ch1':
    case 'in1':
      return 'in1'
    case 'ch2':
    case 'in2':
      return 'in2'
    case 'ch3':
    case 'in3':
      return 'in3'
    case 'ch4':
    case 'in4':
      return 'in4'
    // Pass through cleaned canonical names.  If no alias applies,
    // return the de-spaced, lowercased key to avoid issues like
    // "FREQ CV" not matching "freqcv".  This ensures that port
    // identifiers with spaces or parentheses still resolve to
    // sensible identifiers.
    default:
      return key
  }
}

export function connect(from: { module: ModuleInstance, portKey: string }, to: { module: ModuleInstance, portKey: string }, kind: Connection['kind']): () => void {
  const rFrom = ensureRuntime(from.module)
  const rTo = ensureRuntime(to.module)
  if (kind === 'event') {
    const routeK = routerKey({ moduleId: from.module.id, portKey: from.portKey })
    const list = eventRoutes.get(routeK) ?? []
    list.push({ moduleId: to.module.id, portKey: to.portKey })
    eventRoutes.set(routeK, list)
    return () => {
      const arr = eventRoutes.get(routeK) ?? []
      const idx = arr.findIndex(x => x.moduleId === to.module.id && x.portKey === to.portKey)
      if (idx >= 0) arr.splice(idx, 1)
      if (arr.length === 0) eventRoutes.delete(routeK); else eventRoutes.set(routeK, arr)
    }
  }
  // Normalize port names before looking up nodes. Without this, a UI
  // port like 'freq' would not match the runtime's 'frequency' input on
  // the VCO. Missing nodes will trigger a warning and skip the connection.
  const fromKey = normalizePortName(from.portKey)
  const toKey = normalizePortName(to.portKey)
  const outNode = rFrom.getOut(fromKey) as any
  const inNode = rTo.getIn(toKey) as any
  if (!outNode || !inNode) { console.warn('Cannot connect: missing node', { from, to, kind }); return () => {} }
  const router = getRouter({ moduleId: from.module.id, portKey: from.portKey }, outNode)
  try { router.connect(inNode) } catch (e) { console.warn('Connect error', e) }
  return () => { try { router.disconnect(inNode) } catch {} }
}

export function emitEvent(from: { moduleId: string, portKey: string }, ev: { type: 'trigger'|'gate'|'clock', value?: number }) {
  const k = routerKey({ moduleId: from.moduleId, portKey: from.portKey })
  const dests = eventRoutes.get(k) ?? []
  for (const dest of dests) {
    const rt = runtimes.get(dest.moduleId)
    if (rt?.onEvent) rt.onEvent(dest.portKey, ev)
  }
}
