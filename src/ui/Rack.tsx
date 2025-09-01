import React from 'react'
import { useStore } from './store'
import ModuleView from './ModuleView'

export default function Rack() {
  const modules = useStore(s => s.modules)
  return (
    <div style={{position:'relative', width:'4000px', height:'2000px'}}>
      {modules.map(m => <ModuleView key={m.id} mod={m} />)}
    </div>
  )
}
