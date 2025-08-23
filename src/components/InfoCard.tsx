"use client";
export function InfoCard({ title, description, href }: { title: string; description: string; href?: string }) {
  return (
    <a href={href ?? "#"} className="block rounded-2xl bg-pinto-soft p-5 shadow-card hover:opacity-95">
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-1 text-sm text-gray-700">{description}</div>
    </a>
  );
}
