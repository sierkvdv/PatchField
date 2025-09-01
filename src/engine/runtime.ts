import { moduleRegistry } from './registry'
import { getModuleById } from './util'

type Runtime = {
  audio?: Record<string, any>
  control?: Record<string, any>
  event?: Record<string, any>
}

const cache = new Map<string, Runtime>()

export function ensureRuntime(moduleId: string): Runtime | null {
  if (cache.has(moduleId)) return cache.get(moduleId)!
  const mod = getModuleById(moduleId)
  if (!mod) return null
  const entry = moduleRegistry[mod.type]
  const rt = entry.createRuntime(mod)
  cache.set(moduleId, rt)
  return rt
}
