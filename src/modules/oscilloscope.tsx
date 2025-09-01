import React, { useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { Jack } from '../ui/module/Jack'
import { ModuleInstance, ModuleRuntime, PortSpec } from '../patch/types'

export const scopeTemplate = {
  title: 'Oscilloscope',
  defaults: { },
  ports: [ { key: 'in', label: 'IN', direction: 'in', kind: 'audio' } as PortSpec ]
}

export function createScopeRuntime(mod: ModuleInstance): ModuleRuntime {
  const analyser = new Tone.Analyser('waveform', 1024)
  return { getOut:()=>null, getIn:(k)=>(k==='in'?analyser:null), update:()=>{}, dispose:()=>{ analyser.dispose() } }
}

export const ScopeUI: React.FC<{ mod: ModuleInstance }> = ({ mod }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<Tone.Analyser | null>(null)
  useEffect(() => {
    const rtIn: any = document.querySelector(`[data-module-id="${mod.id}"]`) // just to keep reference
    // In deze simplified build laten we analyserRef leeg en tekenen we een placeholder ke waveform
    let raf = 0
    const ctx = canvasRef.current!.getContext('2d')!
    const draw = () => {
      const w = canvasRef.current!.width, h = canvasRef.current!.height
      ctx.clearRect(0,0,w,h)
      ctx.strokeStyle = '#7c3aed'
      ctx.beginPath()
      for (let i=0;i<128;i++) {
        const x = (i/127)*w
        const y = h/2 + Math.sin(i/6) * h/4
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y)
      }
      ctx.stroke()
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [mod.id])
  return (
    <div className="col">
      <canvas ref={canvasRef} className="scope" width={256} height={120} />
      <div className="jack-row"><Jack moduleId={mod.id} portKey="in" label="IN" direction="in" kind="audio" /></div>
    </div>
  )
}
