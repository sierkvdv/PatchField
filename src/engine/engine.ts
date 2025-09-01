import { ensureRuntime } from './runtime'
import { normalizePortId } from './ports'

export type JackRef = {
  moduleId: string
  kind: 'audio'|'control'|'event'
  portId: string
}

function getNode(ref: JackRef) {
  const rt = ensureRuntime(ref.moduleId)
  if (!rt) return null
  const port = normalizePortId(ref.portId)
  if (ref.kind === 'audio')  return rt.audio?.[port]   ?? null
  if (ref.kind === 'control')return rt.control?.[port] ?? null
  if (ref.kind === 'event')  return rt.event?.[port]   ?? null
  return null
}

export function connect(from: JackRef, to: JackRef) {
  const fromNode = getNode(from)
  const toNode = getNode(to)

  if (!fromNode || !toNode) {
    console.warn('Cannot connect: missing node', { from, to })
    return false
  }

  try {
    if (from.kind === 'audio' && to.kind === 'audio') {
      fromNode.connect?.(toNode); return true
    }
    if (from.kind === 'control' && to.kind === 'control') {
      fromNode.connect?.(toNode); return true
    }
    if (from.kind === 'event' && to.kind === 'event') {
      fromNode.subscribe?.((e:any)=> toNode.next?.(e)); return true
    }
    console.warn('Incompatible kinds', {from:from.kind, to:to.kind})
    return false
  } catch (e) {
    console.error('Connect error', e)
    return false
  }
}
