// Shared price row primitive used across multiple steps

export function OrderRow({
  label,
  value,
  emphasis,
  strike,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  strike?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-zinc-400">{label}</span>
      <span className={`font-semibold ${emphasis ? 'text-white text-sm' : strike ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
        {value}
      </span>
    </div>
  );
}
