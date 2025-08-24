'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from 'react'
import { Stage, Layer, Line, Circle, Image as KImage, Text as KText, Transformer } from 'react-konva'
import useImage from 'use-image'
import { useEditorStore } from '@/store/editorStore'
import type { ImageNode, TextNode } from '@/types/editor'

export function ProductEditor() {
  const { state, select, setHole } = useEditorStore() as any
  const selSet = new Set(state.selectedIds)

  // 팬/줌
  const stageRef = useRef<any>(null)
  const onWheel = (e: any) => {
    e.evt.preventDefault()
    const scaleBy = 1.05
    const oldScale = state.ui.zoom
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
    useEditorStore.getState().setZoom(newScale)
  }

  const holeRadiusPx = (state.hole.diameterMM / 25.4) * state.size.dpi / 2
  const onHoleDrag = (e: any) => { setHole(e.target.x(), e.target.y()) }

  return (
    <div className="relative h-full w-full overflow-auto">
      <div className="relative mx-auto h-full min-h-[560px] w-full max-w-[1400px] bg-[#e6e6e6]">
        <div className="m-6 rounded-md border border-dashed border-gray-300 bg-white/90 p-4 shadow-inner">
          <Stage
            ref={stageRef}
            width={state.stageWidth * state.ui.zoom}
            height={(state.stageHeight * state.ui.zoom)}
            scaleX={state.ui.zoom}
            scaleY={state.ui.zoom}
            draggable={state.ui.isPanning}
            onWheel={onWheel}
            onMouseDown={(e:any)=>{ if (e.target === e.target.getStage()) select([]) }}
            style={{ background:'#f7f7f7', borderRadius: 8 }}
          >
            <Layer>
              {/* 보드/컷라인 (있다면 표시) */}
              {state.boardPath?.path?.length ? (<Line points={state.boardPath.path.flatMap((p:any)=>[p.x,p.y])} closed stroke="#9ca3af" strokeWidth={2} fill="#fff" />) : null}
              {state.cutlinePath?.path?.length ? (<Line points={state.cutlinePath.path.flatMap((p:any)=>[p.x,p.y])} closed stroke="#3b82f6" strokeWidth={2} />) : null}

              {/* 노드 */}
              {state.nodes.map((n:any) => {
                const isSel = selSet.has(n.id)
                if (n.type==='image') return <ImageNodeView key={n.id} node={n} isSelected={isSel} />
                if (n.type==='text')  return <TextNodeView  key={n.id} node={n} isSelected={isSel} />
                return null
              })}

              {/* 키링 홀 */}
              <Circle x={state.hole.x} y={state.hole.y} radius={holeRadiusPx} stroke="#111" strokeWidth={1} fill="#fff" draggable onDragMove={onHoleDrag} />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  )
}

function ImageNodeView({ node, isSelected }: { node: ImageNode, isSelected: boolean }) {
  const { updateNode, select } = useEditorStore() as any
  const [img] = useImage(node.src, 'anonymous')
  const ref = useRef<any>(null)
  const trRef = useRef<any>(null)
  React.useEffect(()=>{ if(isSelected && trRef.current){ trRef.current.nodes([ref.current]); trRef.current.getLayer()?.batchDraw() }},[isSelected])
  return (
    <>
      <KImage
        ref={ref} image={img||undefined}
        x={node.x} y={node.y} rotation={node.rotation} opacity={node.opacity}
        scaleX={node.scaleX} scaleY={node.scaleY} draggable={!node.locked}
        onClick={()=>select([node.id])} onTap={()=>select([node.id])}
        onDragEnd={(e:any)=>updateNode(node.id, { x: e.target.x(), y: e.target.y() })}
        onTransformEnd={()=>{ const n=ref.current; updateNode(node.id, { x:n.x(), y:n.y(), rotation:n.rotation(), scaleX:n.scaleX(), scaleY:n.scaleY() }) }}
      />
      {isSelected && <Transformer ref={trRef} rotateEnabled />}
    </>
  )
}
function TextNodeView({ node, isSelected }: { node: TextNode, isSelected: boolean }) {
  const { updateNode, select } = useEditorStore() as any
  const ref = useRef<any>(null)
  const trRef = useRef<any>(null)
  React.useEffect(()=>{ if(isSelected && trRef.current){ trRef.current.nodes([ref.current]); trRef.current.getLayer()?.batchDraw() }},[isSelected])
  return (
    <>
      <KText
        ref={ref} text={node.text}
        x={node.x} y={node.y} rotation={node.rotation}
        scaleX={node.scaleX} scaleY={node.scaleY}
        fontFamily={node.fontFamily} fontSize={node.fontSize} fill={node.fill}
        draggable={!node.locked}
        onClick={()=>select([node.id])} onTap={()=>select([node.id])}
        onDragEnd={(e:any)=>updateNode(node.id, { x:e.target.x(), y:e.target.y() })}
        onTransformEnd={()=>{ const n=ref.current; updateNode(node.id, { x:n.x(), y:n.y(), rotation:n.rotation(), scaleX:n.scaleX(), scaleY:n.scaleY() }) }}
      />
      {isSelected && <Transformer ref={trRef} rotateEnabled />}
    </>
  )
}
