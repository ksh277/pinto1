'use client';

import { useState } from 'react';

export const metadata = {
  title: '브랜드 의뢰',
};

export default function BrandRequestPage() {
  const [form, setForm] = useState({ name: '', email: '', brand: '', requirements: '' });
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">브랜드 의뢰</h1>
      <form className="space-y-4">
        <input className="w-full rounded border p-2" placeholder="이름" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="이메일" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="브랜드" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
        <textarea className="w-full rounded border p-2" placeholder="요구사항" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} />
        <div>
          <label className="block mb-1 text-sm">파일 업로드</label>
          <input type="file" className="w-full" />
        </div>
        <button type="submit" className="rounded bg-primary px-4 py-2 text-white">제출</button>
      </form>
    </main>
  );
}
