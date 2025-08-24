'use client'
import React from 'react'
import { useEditorStore } from '@/store/editorStore'

export function ProductTypeSelector() {
  const { state, setMode, setTemplate } = useEditorStore()
  return (
    <aside className="w-72 shrink-0 p-3 space-y-3 border rounded-2xl bg-white">
      <div className="space-y-2">
        <h3 className="font-semibold">모드</h3>
        <div className="grid grid-cols-2 gap-2">
          <button className={`rounded-xl border px-3 py-2 ${state.mode==='auto'?'bg-black text-white':''}`} onClick={()=>setMode('auto')}>오토</button>
          <button className={`rounded-xl border px-3 py-2 ${state.mode==='template'?'bg-black text-white':''}`} onClick={()=>setMode('template')}>템플릿</button>
        </div>
      </div>
      {state.mode==='template' && (
        <div className="space-y-2">
          <h3 className="font-semibold">판 모양</h3>
          <div className="grid grid-cols-4 gap-2">
            {(['rect','circle','pentagon','hexagon'] as const).map(t=> (
              <button key={t} className={`rounded-xl border px-2 py-1 ${state.templatePlate===t?'bg-black text-white':''}`} onClick={()=>setTemplate(t)}>{t}</button>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
