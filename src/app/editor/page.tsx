'use client'
import React, { useState } from 'react'
import { EditorLayout } from '@/components/editor/EditorLayout'

export default function EditorPage() {
  const [picked, setPicked] = useState<null | string>(null)
  return (
    <>
      {!picked && <ProductPicker onPick={setPicked} />}
      {picked && <EditorLayout initialProduct={picked} />}
    </>
  )
}

function ProductPicker({ onPick }: { onPick: (id: string) => void }) {
  const items = [
    { id: 'keyring', label: '키링' },
    { id: 'stand', label: '스탠드' },
    { id: 'coaster', label: '코르크' },
    { id: 'pouch', label: '포카홀더' },
    { id: 'smarttok', label: '스마트톡' },
    { id: 'badge', label: '뱃지' },
    { id: 'stationery', label: '자석/문구류' },
    { id: 'carabiner', label: '카라비너', disabled: true },
  ]
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center text-xl font-semibold">에디터를 이용하실 상품을 선택해주세요</div>
        <div className="grid grid-cols-4 gap-4">
          {items.map(it => (
            <button
              key={it.id}
              disabled={it.disabled}
              onClick={() => !it.disabled && onPick(it.id)}
              className={`aspect-[4/3] rounded-2xl border p-4 text-center transition
                          ${it.disabled ? 'bg-gray-200 text-gray-400' : 'hover:border-teal-500 hover:shadow'}`}
            >
              <div className="h-full w-full rounded-xl bg-gray-50" />
              <div className="mt-2 font-medium">{it.label}{it.disabled && ' (준비중)'}</div>
            </button>
          ))}
        </div>
        <div className="mt-6 text-right">
          <button onClick={() => history.back()} className="rounded-xl border px-4 py-2 text-sm">에디터 나가기</button>
        </div>
      </div>
    </div>
  )
}
