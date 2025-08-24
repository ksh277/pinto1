'use client'
import React, { useState } from 'react'
import { useEditorStore } from '@/store/editorStore'

const DPI = 300
const mmToPx = (mm:number) => (mm/25.4)*DPI

export function SizeSelector(){
  const { state, setSizeMM } = useEditorStore()
  const [w,setW] = useState(state.size.widthMM)
  const [h,setH] = useState(state.size.heightMM)
  const apply = () => setSizeMM(w,h)
  return (
    <div className="p-3 border rounded-2xl bg-white">
      <h3 className="font-semibold mb-2">사이즈(mm)</h3>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">W<input value={w} onChange={e=>setW(parseFloat(e.target.value||'0'))} type="number" className="w-full border rounded px-2 py-1"/></label>
        <label className="text-sm">H<input value={h} onChange={e=>setH(parseFloat(e.target.value||'0'))} type="number" className="w-full border rounded px-2 py-1"/></label>
      </div>
      <div className="flex gap-2 mt-2"><button onClick={apply} className="rounded-xl border px-3 py-2 w-full">적용</button></div>
      <div className="mt-2 text-xs text-gray-500">px: {Math.round(mmToPx(w))} x {Math.round(mmToPx(h))}</div>
    </div>
  )
}
