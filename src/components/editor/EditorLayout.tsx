'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react'
import Link from 'next/link'
import { useEditorStore } from '@/store/editorStore'
import { ProductEditor } from './ProductEditor'

export function EditorLayout({ initialProduct: _initialProduct }: { initialProduct?: string }) {
  const { undo, redo, removeSelected, setPanning } = useEditorStore() as any

  // Esc로 이동툴 해제
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPanning(false) }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [setPanning])

  return (
    <div className="flex h-[calc(100vh)] flex-col bg-[#efefef]">
      {/* 상단 바 */}
      <header className="flex h-14 items-center justify-between bg-white px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="font-semibold">ALL THAT PRINTING <span className="text-xs font-normal">EDITOR</span></div>
          <div className="text-sm text-gray-500">|</div>
          <select className="rounded-md border px-2 py-1 text-sm">
            <option>키링</option>
            <option>스탠드</option>
            <option>스마트톡</option>
          </select>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <ToolbarButton onClick={undo}>이전</ToolbarButton>
          <ToolbarButton onClick={redo}>이후</ToolbarButton>
          <ToolbarButton onClick={() => setPanning(true)}>이동</ToolbarButton>
          <ToolbarButton onClick={removeSelected}>삭제</ToolbarButton>
        </div>
        <div className="flex items-center gap-2">
          <ToolbarGhostButton onClick={()=>document.getElementById('file-input')?.click()}>불러오기</ToolbarGhostButton>
          <ToolbarGhostButton onClick={()=>document.getElementById('btn-save')?.dispatchEvent(new Event('click',{bubbles:true}))}>저장</ToolbarGhostButton>
          <ToolbarPrimaryButton onClick={()=>document.getElementById('btn-pdf')?.dispatchEvent(new Event('click',{bubbles:true}))}>PDF 다운로드</ToolbarPrimaryButton>
          <Link href="/" className="rounded-md border px-3 py-2 text-sm">✕ 창닫기</Link>
        </div>
      </header>

      {/* 본문 */}
      <div className="grid flex-1 grid-cols-[280px_1fr] gap-0">
        <LeftRail />
        <div className="relative">
          <ProductEditor />
          <BottomBar />
        </div>
      </div>
    </div>
  )
}

function ToolbarButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className="text-sm text-gray-600 hover:text-black" />
}
function ToolbarGhostButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className="rounded-md border px-3 py-2 text-sm" />
}
function ToolbarPrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className="rounded-md bg-black px-3 py-2 text-sm text-white" />
}

/** 좌측 레일 */
function LeftRail() {
  const { state, setMode, setTemplate, setSizeMM, lockSize, addImageFromSrc, addText, setBgSample, setBgThreshold, setCutOffsetMM, setWhiteShrinkMM } = useEditorStore() as any
  const [w, setW] = React.useState(state.size.widthMM)
  const [h, setH] = React.useState(state.size.heightMM)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const firstImg = state.nodes.find((n: any) => n.type === 'image') as any

  return (
    <aside className="flex h-full flex-col bg-[#2b2b2b] text-white">
      {/* 탭 */}
      <div className="grid h-12 grid-cols-2">
        <button className={`text-sm ${state.mode==='auto'?'bg-[#1f1f1f]':''}`} onClick={()=>setMode('auto')}>자율형</button>
        <button className={`text-sm ${state.mode==='template'?'bg-[#1f1f1f]':''}`} onClick={()=>setMode('template')}>템플릿핑</button>
      </div>

      {/* 섹션 */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4 text-sm">
        <div>
          <div className="mb-2 text-gray-300">사이즈 (mm)</div>
          <div className="flex gap-2">
            <input type="number" className="w-20 rounded bg-[#1f1f1f] px-2 py-1" value={w} onChange={e=>setW(parseFloat(e.target.value||'0'))} />
            <input type="number" className="w-20 rounded bg-[#1f1f1f] px-2 py-1" value={h} onChange={e=>setH(parseFloat(e.target.value||'0'))} />
            <button className="rounded bg-white px-3 py-1 text-black" onClick={()=>{ setSizeMM(w,h); lockSize(true) }}>적용</button>
          </div>
          {!state.ui.sizeLocked && <div className="mt-3 text-xs text-gray-400">사이즈 선택 후 이용 가능합니다.</div>}
        </div>

        <div>
          <div className="mb-2 text-gray-300">이미지</div>
          <input id="file-input" ref={fileRef} type="file" accept="image/*" hidden
                 onChange={e=>{ const f=e.target.files?.[0]; if(f){ const r=new FileReader(); r.onload=()=>addImageFromSrc(r.result as string); r.readAsDataURL(f) }}}/>
          <button className="w-full rounded bg-white px-3 py-2 text-black" onClick={()=>fileRef.current?.click()} disabled={!state.ui.sizeLocked}>이미지 불러오기</button>
          {firstImg ? (
            <div className="mt-2">
              <img src={firstImg.src} alt="preview" className="w-full cursor-crosshair" onClick={e=>{
                const img=e.currentTarget
                const rect=img.getBoundingClientRect()
                const x=e.clientX-rect.left, y=e.clientY-rect.top
                const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight
                const ctx=c.getContext('2d')!; ctx.drawImage(img,0,0)
                const sx=Math.floor(x*img.naturalWidth/rect.width)
                const sy=Math.floor(y*img.naturalHeight/rect.height)
                const d=ctx.getImageData(sx,sy,1,1).data
                setBgSample([d[0],d[1],d[2]])
              }} />
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-400">배경제거 임계값</span>
                <input type="range" min={0} max={128} value={state.bgThreshold} onChange={e=>setBgThreshold(parseInt(e.target.value))} />
                <span className="w-8 text-center">{state.bgThreshold}</span>
              </div>
              <div className="mt-1 text-xs text-gray-400">이미지 위를 클릭하면 배경색 샘플링</div>
            </div>
          ) : null}
        </div>

        <div>
          <div className="mb-2 text-gray-300">텍스트</div>
          <button className="w-full rounded border border-white/30 px-3 py-2" onClick={()=>addText('텍스트')} disabled={!state.ui.sizeLocked}>텍스트 추가</button>
        </div>

        <div>
          <div className="mb-2 text-gray-300">컷/화이트</div>
          <div className="space-y-2">
            <div>
              <input type="range" min={2} max={15} value={state.offsets.cutOffsetMM} onChange={e=>setCutOffsetMM(parseFloat(e.target.value))} />
              <div className="mt-1 text-xs">컷 오프셋 {state.offsets.cutOffsetMM.toFixed(1)}mm</div>
            </div>
            <div>
              <input type="range" min={0.06} max={0.10} step={0.01} value={state.whiteShrinkMM} onChange={e=>setWhiteShrinkMM(parseFloat(e.target.value))} />
              <div className="mt-1 text-xs">화이트 수축 {state.whiteShrinkMM.toFixed(2)}mm</div>
            </div>
          </div>
        </div>

        {state.mode==='template' && (
          <div>
            <div className="mb-2 text-gray-300">판 모양</div>
            <div className="grid grid-cols-4 gap-2">
              {(['rect','circle','pentagon','hexagon'] as const).map(t=> (
                <button key={t} className={`rounded px-2 py-1 ${state.templatePlate===t?'bg-white text-black':'bg-[#1f1f1f]'}`} onClick={()=>setTemplate(t)}>{t}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

/** 하단 바 */
function BottomBar() {
  const { state, setRingCount, setRingSize, toggleRingBack, toggleRingFront, setWhiteWrap, zoomOut, zoomIn } = useEditorStore() as any
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 border-t bg-white/95 px-4 py-2">
      <div className="flex items-center gap-3 text-sm">
        <label className="flex items-center gap-2">고리개수
          <button className="rounded border px-2" onClick={()=>setRingCount(state.ui.ringCount-1)}>-</button>
          <span className="w-6 text-center">{state.ui.ringCount}</span>
          <button className="rounded border px-2" onClick={()=>setRingCount(state.ui.ringCount+1)}>+</button>
        </label>

        <div className="flex items-center gap-2">
          고리방향
          <label className="flex items-center gap-1"><input type="checkbox" checked={state.ui.ringBack} onChange={toggleRingBack}/> 바깥쪽</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={state.ui.ringFront} onChange={toggleRingFront}/> 안쪽</label>
        </div>

        <div className="flex items-center gap-2">
          고리크기
          {[2,2.5,3,4].map(mm=> (
            <button key={mm} className={`rounded border px-2 ${state.ui.ringSizeMM===mm?'bg-black text-white':''}`} onClick={()=>setRingSize(mm)}>{mm}mm</button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          화이트둘러싸기
          <button className="rounded border px-2" onClick={()=>setWhiteWrap(state.ui.whiteWrap-1)}>-</button>
          <span className="w-6 text-center">{state.ui.whiteWrap}</span>
          <button className="rounded border px-2" onClick={()=>setWhiteWrap(state.ui.whiteWrap+1)}>+</button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="rounded border px-2" onClick={zoomOut}>-</button>
          <span className="w-14 text-center">{Math.round(state.ui.zoom*100)}%</span>
          <button className="rounded border px-2" onClick={zoomIn}>+</button>
          <button id="btn-pdf" className="hidden" />
          <button id="btn-save" className="hidden" />
        </div>
      </div>
    </div>
  )
}
