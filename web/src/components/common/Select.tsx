import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Shown when no option matches `value` */
  placeholder?: string;
  /** Accessible name when there's no visible <label> pointing at `id` */
  ariaLabel?: string;
  id?: string;
  disabled?: boolean;
  /** Optional icon (Material Symbols name) shown at the left of the trigger */
  icon?: string;
}

const PANEL_GAP = 6;
const PANEL_MAX_HEIGHT = 320;
const ANIMATION_MS = 140;

/**
 * Smooth, app-styled replacement for <select>.
 * - Opens with a short fade/scale animation, below the field (or above if there's no room)
 * - Mouse, touch and keyboard: arrows, Home/End, Enter/Space, Esc, Tab, type-to-jump
 * - The list renders in a portal so it's never clipped by cards or scroll containers
 */
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  ariaLabel,
  id,
  disabled = false,
  icon,
}) => {
  const autoId = useId();
  const triggerId = id ?? `select-${autoId}`;
  const listId = `${triggerId}-list`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef<{ text: string; timer?: number }>({ text: '' });

  const [open, setOpen] = useState(false); // logically open
  const [mounted, setMounted] = useState(false); // in the DOM (stays during close animation)
  const [visible, setVisible] = useState(false); // drives the animation
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; maxHeight: number; above: boolean }>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: PANEL_MAX_HEIGHT,
    above: false,
  });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // The field scrolled off-screen: close instead of leaving the list floating
    if (r.bottom < 0 || r.top > window.innerHeight) {
      setOpen(false);
      return;
    }
    const spaceBelow = window.innerHeight - r.bottom - PANEL_GAP - 8;
    const spaceAbove = r.top - PANEL_GAP - 8;
    const wanted = Math.min(PANEL_MAX_HEIGHT, options.length * 44 + 12);
    const above = spaceBelow < wanted && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(PANEL_MAX_HEIGHT, above ? spaceAbove : spaceBelow));
    setPos({
      top: above ? r.top - PANEL_GAP : r.bottom + PANEL_GAP,
      left: r.left,
      width: r.width,
      maxHeight,
      above,
    });
  }, [options.length]);

  const openList = (startIndex?: number) => {
    if (disabled) return;
    place();
    setActiveIndex(startIndex ?? (selectedIndex >= 0 ? selectedIndex : 0));
    setOpen(true);
  };

  const closeList = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  const choose = (index: number) => {
    const opt = options[index];
    if (!opt) return;
    if (opt.value !== value) onChange(opt.value);
    closeList();
  };

  // Mount/unmount with an enter and exit animation
  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), ANIMATION_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  // Keep the list attached to the field while scrolling/resizing; close on outside press
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      closeList(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, place, closeList]);

  // Keep the highlighted option in view by scrolling the list only (never the page)
  useLayoutEffect(() => {
    if (!open || activeIndex < 0) return;
    const panel = panelRef.current;
    const item = panel?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    if (!panel || !item) return;
    const pad = 6;
    if (item.offsetTop - pad < panel.scrollTop) {
      panel.scrollTop = item.offsetTop - pad;
    } else if (item.offsetTop + item.offsetHeight + pad > panel.scrollTop + panel.clientHeight) {
      panel.scrollTop = item.offsetTop + item.offsetHeight + pad - panel.clientHeight;
    }
  }, [open, activeIndex, mounted]);

  const jumpByTyping = (key: string) => {
    const ta = typeahead.current;
    window.clearTimeout(ta.timer);
    ta.text += key.toLowerCase();
    ta.timer = window.setTimeout(() => (ta.text = ''), 600);
    const from = open ? activeIndex : selectedIndex;
    const ordered = [...options.slice(from + 1), ...options.slice(0, from + 1)];
    const match =
      ordered.find((o) => o.label.toLowerCase().startsWith(ta.text)) ??
      ordered.find((o) => o.label.toLowerCase().startsWith(key.toLowerCase()));
    if (!match) return;
    const idx = options.indexOf(match);
    if (open) setActiveIndex(idx);
    else if (match.value !== value) onChange(match.value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const last = options.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) openList();
        else setActiveIndex((i) => Math.min(last, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) openList();
        else setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        if (open) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      case 'End':
        if (open) {
          e.preventDefault();
          setActiveIndex(last);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (open) choose(activeIndex);
        else openList();
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          closeList();
        }
        break;
      case 'Tab':
        if (open) closeList(false);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          jumpByTyping(e.key);
        }
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-activedescendant={open && activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={(e) => {
          // A <label> wrapping this button forwards clicks; only react to real ones
          e.preventDefault();
          if (open) closeList();
          else openList();
        }}
        onKeyDown={onKeyDown}
        className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left font-body-md text-body-md transition-all duration-150 outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
          open
            ? 'bg-surface-container-lowest ring-2 ring-primary shadow-[0_4px_16px_rgba(0,105,72,0.10)]'
            : 'bg-surface-container-low hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary'
        }`}
      >
        {icon && <span className="material-symbols-outlined text-[20px] text-on-surface-variant shrink-0">{icon}</span>}
        <span className={`flex-1 min-w-0 truncate ${selected ? 'text-on-surface' : 'text-outline'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          className={`material-symbols-outlined text-[22px] text-on-surface-variant shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-primary' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {mounted &&
        createPortal(
          <ul
            ref={panelRef}
            id={listId}
            role="listbox"
            aria-labelledby={triggerId}
            tabIndex={-1}
            style={{
              position: 'fixed',
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
              ...(pos.above ? { bottom: window.innerHeight - pos.top } : { top: pos.top }),
              transformOrigin: pos.above ? 'bottom center' : 'top center',
              transitionDuration: `${ANIMATION_MS}ms`,
            }}
            className={`z-[70] overflow-y-auto overscroll-contain rounded-2xl bg-surface-container-lowest p-1.5 shadow-[0_12px_40px_rgba(19,27,46,0.16)] border border-outline-variant/20 transition-[opacity,transform] ease-out ${
              visible ? 'opacity-100 scale-100 translate-y-0' : `opacity-0 scale-[0.97] ${pos.above ? 'translate-y-1' : '-translate-y-1'}`
            }`}
          >
            {options.map((opt, i) => {
              const isSelected = i === selectedIndex;
              const isActive = i === activeIndex;
              return (
                <li
                  key={opt.value}
                  id={`${listId}-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onPointerMove={() => setActiveIndex(i)}
                  onClick={() => choose(i)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer select-none font-body-md text-body-md transition-colors duration-100 ${
                    isActive ? 'bg-secondary-container/40' : ''
                  } ${isSelected ? 'text-primary font-semibold' : 'text-on-surface'}`}
                >
                  <span className="flex-1 min-w-0">{opt.label}</span>
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 transition-opacity ${
                      isSelected ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    check
                  </span>
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
};
