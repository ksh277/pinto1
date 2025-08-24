'use client'
import React from 'react'
import dynamic from 'next/dynamic'
const EditorLayout = dynamic(() => import('@/components/editor/EditorLayout').then(m => m.EditorLayout), { ssr: false })

export default function EditorPage() {
  return <EditorLayout />
}
