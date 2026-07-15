
import { Shortcut } from '../../types/shortcut';
import { ShortcutItem } from './ShortcutItem';

interface ShortcutCategoryProps {
  category: string;
  shortcuts: Shortcut[];
}

export function ShortcutCategory({ category, shortcuts }: ShortcutCategoryProps) {
  if (shortcuts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-border pb-2.5 font-mono select-none">
        {category}
      </h3>
      <div className="grid grid-cols-1 gap-3.5">
        {shortcuts.map((shortcut) => (
          <ShortcutItem key={shortcut.id} shortcut={shortcut} />
        ))}
      </div>
    </div>
  );
}
export default ShortcutCategory;
