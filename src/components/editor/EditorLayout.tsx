'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
const ProductEditor = dynamic(() => import('./ProductEditor').then(m => m.ProductEditor), { ssr: false })
import { SizeSelector } from './SizeSelector'
import { ProductTypeSelector } from './ProductTypeSelector'
import { useEditorStore } from '@/store/editorStore'
import type { TemplatePlate } from '@/types/editor'

const DPI = 300
const mmToPx = (mm: number, dpi = DPI) => (mm / 25.4) * dpi

const PRESETS: Record<string, { template: TemplatePlate; width: number; height: number; hole?: { x: number; y: number; diameterMM?: number } }> = {
  keyring: { template: 'rect', width: 70, height: 70, hole: { x: 35, y: 6, diameterMM: 4 } },
  stand: { template: 'rect', width: 100, height: 150 },
  coaster: { template: 'circle', width: 90, height: 90 },
  pouch: { template: 'rect', width: 80, height: 120 },
  smarttok: { template: 'circle', width: 60, height: 60 },
  badge: { template: 'circle', width: 50, height: 50 },
  stationery: { template: 'rect', width: 150, height: 50 },
  carabiner: { template: 'rect', width: 60, height: 80 },
}

export function EditorLayout({ initialProduct }: { initialProduct?: string }) {
  const { setTemplate, setSizeMM, setHole } = useEditorStore()

  useEffect(() => {
    if (!initialProduct) return
    const preset = PRESETS[initialProduct]
    if (!preset) return
    setTemplate(preset.template)
    setSizeMM(preset.width, preset.height)
    if (preset.hole) {
      const { x, y, diameterMM } = preset.hole
      setHole(mmToPx(x), mmToPx(y), diameterMM)
    }
  }, [initialProduct, setTemplate, setSizeMM, setHole])

  return (
    <div className="p-4">
      <div className="max-w-[1280px] mx-auto grid grid-cols-[300px_1fr_300px] gap-4">
        <ProductTypeSelector />
        <div className="flex items-start justify-center">
          <ProductEditor />
        </div>
        <div className="space-y-4">
          <SizeSelector />
          <ExportPanel />
        </div>
      </div>
    </div>
  )
}

function ExportPanel() {
  const onPng = () => {
    const cvs = document.querySelector('canvas') as HTMLCanvasElement
    const url = cvs.toDataURL('image/png')
    download(url, 'design.png')
  }
  const onSvg = () => {
    const cvs = document.querySelector('canvas') as HTMLCanvasElement
    const url = cvs.toDataURL('image/png')
    const svg = `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="${cvs.width}" height="${cvs.height}" viewBox="0 0 ${cvs.width} ${cvs.height}"><image href="${url}" x="0" y="0" width="${cvs.width}" height="${cvs.height}"/></svg>`
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    download(URL.createObjectURL(blob), 'design.svg')
  }
  const onPdf = async () => {
    const { default: jsPDF } = await import('jspdf')
    const cvs = document.querySelector('canvas') as HTMLCanvasElement
    const url = cvs.toDataURL('image/png')
    const pdf = new jsPDF({ unit: 'mm', format: [210, 297] }) // A4 예시
    pdf.addImage(url, 'PNG', 10, 10, 190, (190 * cvs.height) / cvs.width)
    pdf.save('design.pdf')
  }
  const onSave = async () => {
    const cvs = document.querySelector('canvas') as HTMLCanvasElement
    const previewDataUrl = cvs.toDataURL('image/png')
    const payload = (window as any).__EDITOR_PAYLOAD__
    const res = await fetch('/api/designs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, previewDataUrl }) })
    const json = await res.json()
    if (!json.ok) return alert('저장 실패: ' + json.error)
    alert('DB 저장 완료: ' + json.id)
  }
  return (
    <div className="p-3 border rounded-2xl bg-white space-y-2">
      <h3 className="font-semibold">내보내기/저장</h3>
      <div className="grid grid-cols-3 gap-2">
        <button className="rounded-xl border px-2 py-1" onClick={onPng}>PNG</button>
        <button className="rounded-xl border px-2 py-1" onClick={onSvg}>SVG</button>
        <button className="rounded-xl border px-2 py-1" onClick={onPdf}>PDF</button>
      </div>
      <button className="w-full rounded-xl border px-3 py-2" onClick={onSave}>DB 저장</button>
    </div>
  )
}
function download(url: string, name: string) { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove() }
