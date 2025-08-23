type Item = { id: string; label: string; icon?: string };
export function CategoryShortcuts({ items }: { items: Item[] }) {
  return (
    <div className="my-6">
      <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible">
        {items.map((it) => (
          <a key={it.id} href={`/category/${it.id}`} className="shrink-0 md:shrink block rounded-2xl bg-pinto-soft px-4 py-3 text-center hover:opacity-90">
            <div className="text-sm font-medium">{it.label}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
