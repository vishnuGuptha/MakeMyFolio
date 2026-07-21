import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

/** Swap item at index with neighbor; returns new ordered id list */
export function moveItemIds<T extends { _id: string }>(
  items: T[],
  index: number,
  direction: -1 | 1
): string[] {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next.map((i) => i._id);
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((i) => i._id);
}

/** Move item from → to (array indices); returns new ordered id list */
export function reorderItemIds<T extends { _id: string }>(
  items: T[],
  fromIndex: number,
  toIndex: number
): string[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
    return items.map((i) => i._id);
  }
  if (fromIndex >= items.length || toIndex >= items.length) {
    return items.map((i) => i._id);
  }
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((i) => i._id);
}

type SortableCtx = {
  disabled: boolean;
  dragIndex: number | null;
  overIndex: number | null;
  onHandleDragStart: (index: number, e: DragEvent) => void;
  onItemDragOver: (index: number, e: DragEvent) => void;
  onItemDrop: (index: number, e: DragEvent) => void;
  onDragEnd: () => void;
};

const SortableContext = createContext<SortableCtx | null>(null);

function useSortable() {
  const ctx = useContext(SortableContext);
  if (!ctx) throw new Error('Sortable components must be used inside SortableList');
  return ctx;
}

export function SortableList({
  disabled = false,
  onReorder,
  children,
  className,
}: {
  disabled?: boolean;
  onReorder: (fromIndex: number, toIndex: number) => void | Promise<void>;
  children: ReactNode;
  className?: string;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const onHandleDragStart = useCallback((index: number, e: DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    dragIndexRef.current = index;
    setDragIndex(index);
    setOverIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    // Transparent drag image optional; default ghost is fine
  }, [disabled]);

  const onItemDragOver = useCallback((index: number, e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIndex((prev) => (prev === index ? prev : index));
  }, []);

  const onDragEnd = useCallback(() => {
    dragIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  const onItemDrop = useCallback(
    async (index: number, e: DragEvent) => {
      e.preventDefault();
      const from =
        dragIndexRef.current ??
        Number.parseInt(e.dataTransfer.getData('text/plain'), 10);
      onDragEnd();
      if (Number.isNaN(from) || from === index) return;
      await onReorder(from, index);
    },
    [onDragEnd, onReorder]
  );

  return (
    <SortableContext.Provider
      value={{
        disabled,
        dragIndex,
        overIndex,
        onHandleDragStart,
        onItemDragOver,
        onItemDrop,
        onDragEnd,
      }}
    >
      <div className={cn('space-y-3', className)}>{children}</div>
    </SortableContext.Provider>
  );
}

export function SortableItem({
  index,
  children,
  className,
}: {
  index: number;
  children: ReactNode;
  className?: string;
}) {
  const { dragIndex, overIndex, onItemDragOver, onItemDrop, onDragEnd } = useSortable();
  const isDragging = dragIndex === index;
  const isOver = overIndex === index && dragIndex !== null && dragIndex !== index;

  return (
    <div
      className={cn(
        'transition-all duration-150',
        isDragging && 'opacity-40 scale-[0.99]',
        isOver && 'ring-2 ring-accent/40 ring-offset-2 ring-offset-base rounded-xl',
        className
      )}
      onDragOver={(e) => onItemDragOver(index, e)}
      onDrop={(e) => onItemDrop(index, e)}
      onDragLeave={() => {
        /* keep overIndex until next over / end */
      }}
      onDragEnd={onDragEnd}
    >
      {children}
    </div>
  );
}

/** Grab handle — only this element starts a drag (inputs stay editable). */
export function SortableDragHandle({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  const { disabled, onHandleDragStart, onDragEnd } = useSortable();

  return (
    <Tooltip content="Drag to reorder">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        draggable={!disabled}
        aria-disabled={disabled}
        aria-label="Drag to reorder"
        onDragStart={(e) => onHandleDragStart(index, e)}
        onDragEnd={onDragEnd}
        onKeyDown={(e) => {
          // Keyboard: leave for now; drag is pointer-led
          if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
        }}
        className={cn(
          'shrink-0 touch-none select-none',
          'flex h-10 w-8 items-center justify-center rounded-lg',
          'text-subtle hover:text-primary hover:bg-muted/80',
          'cursor-grab active:cursor-grabbing',
          'transition-colors',
          disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
          className
        )}
      >
        <GripVertical className="h-5 w-5 pointer-events-none" strokeWidth={2} />
      </div>
    </Tooltip>
  );
}
