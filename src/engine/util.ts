import { useStore } from '../ui/store'
import type { ModuleInstance } from '../ui/store'

export function getModuleById(id: string): ModuleInstance | undefined {
  const s = useStore.getState()
  return s.modules.find(m => m.id === id)
}
