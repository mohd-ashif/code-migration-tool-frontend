

interface ShortcutBadgeProps {
  keys: string;
}

export function ShortcutBadge({ keys }: ShortcutBadgeProps) {
  return (
    <kbd className="inline-flex items-center justify-center px-2 py-0.5 bg-[#1E1F35] border border-[#2B2C4E] text-[#D1D5DB] text-[9.5px] font-bold font-mono rounded shadow-inner min-w-[20px]">
      {keys}
    </kbd>
  );
}
export default ShortcutBadge;
