import React, { useRef } from 'react'
import Draggable from 'react-draggable'
import { ModuleInstance, useStore } from './store'
import { moduleRegistry } from '../engine/registry'

export default function ModuleView({ mod }: { mod: ModuleInstance }) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const move = useStore(s => s.moveModule)
  const beginPatch = useStore(s => s.beginPatch)
  const tryCompletePatch = useStore(s => s.tryCompletePatch)

  const ports = moduleRegistry[mod.type].uiPorts

  const Port = ({ kind, portId, label }: { kind: 'audio'|'control'|'event', portId: string, label?:string }) => (
    <div
      className={`port ${kind}`}
      onClick={(e)=>{
        e.stopPropagation()
        if (!useStore.getState().pendingJack) beginPatch({ moduleId: mod.id, kind, portId })
        else tryCompletePatch({ moduleId: mod.id, kind, portId })
      }}
      title={`${kind}:${portId}`}
    >
      {label ?? portId}
    </div>
  )

  return (
    <Draggable nodeRef={nodeRef} position={{x:mod.x,y:mod.y}} onDrag={(_,d)=>move(mod.id,d.x,d.y)} handle=".handle">
      <div ref={nodeRef} className="module">
        <div className="handle">{mod.type}</div>
        <div className="content">
          {ports.audioIn?.map(p => <Port key={`ai-${p}`} kind="audio" portId={p} label={`in:${p}`} />)}
          {ports.audioOut?.map(p => <Port key={`ao-${p}`} kind="audio" portId={p} label={`out:${p}`} />)}
          {ports.controlIn?.map(p => <Port key={`ci-${p}`} kind="control" portId={p} />)}
          {ports.controlOut?.map(p => <Port key={`co-${p}`} kind="control" portId={p} />)}
          {ports.eventIn?.map(p => <Port key={`ei-${p}`} kind="event" portId={p} />)}
          {ports.eventOut?.map(p => <Port key={`eo-${p}`} kind="event" portId={p} />)}
        </div>
      </div>
    </Draggable>
  )
}
