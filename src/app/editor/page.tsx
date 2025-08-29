"use client";
import React, { useState } from "react";
import { EditorLayout } from "@/components/editor/EditorLayout";
import ProductEditor from "@/components/editor/ProductEditor";

export default function EditorPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const initial = (searchParams && (searchParams.template || searchParams.type)) ?? null;
  const [picked, setPicked] = useState<null | string>(initial);
  // When a product is picked (or a template/type is provided), render the editor
  return <>{!picked ? <ProductPicker onPick={setPicked} /> : <EditorLayout><ProductEditor /></EditorLayout>}</>;
}

function ProductPicker({ onPick }: { onPick: (id: string) => void }) {
  const items = [
    { id: "keyring", label: "Keyring" },
    { id: "stand", label: "Acrylic Stand" },
    { id: "coaster", label: "Coaster" },
    { id: "pouch", label: "Pouch" },
    { id: "smarttok", label: "Smart Tok" },
    { id: "badge", label: "Badge" },
    { id: "stationery", label: "Stationery" },
    { id: "carabiner", label: "Carabiner", disabled: true },
  ];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center text-xl font-semibold">Choose a product to customize</div>
        <div className="grid grid-cols-4 gap-4">
          {items.map((it) => (
            <button
              key={it.id}
              disabled={it.disabled}
              onClick={() => !it.disabled && onPick(it.id)}
              className={`aspect-[4/3] rounded-2xl border p-4 text-center transition ${
                it.disabled ? "bg-gray-200 text-gray-400" : "hover:border-teal-500 hover:shadow"
              }`}
            >
              <div className="h-full w-full rounded-xl bg-gray-50" />
              <div className="mt-2 font-medium">
                {it.label}
                {it.disabled && " (coming soon)"}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-6 text-right">
          <button onClick={() => history.back()} className="rounded-xl border px-4 py-2 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
