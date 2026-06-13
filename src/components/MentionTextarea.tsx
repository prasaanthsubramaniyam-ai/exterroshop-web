"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMention, type MentionUser } from "@/hooks/useMention";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  autoFocus?: boolean;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Use <input> instead of <textarea> (for comment inputs) */
  singleLine?: boolean;
}

function MentionDropdown({
  candidates,
  loading,
  searchError,
  query,
  onSelect,
  onDismiss,
}: {
  candidates: MentionUser[];
  loading: boolean;
  searchError: boolean;
  query: string;
  onSelect: (u: MentionUser) => void;
  onDismiss: () => void;
}) {
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-mention-dropdown]")) onDismiss();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onDismiss]);

  // Don't show dropdown until user has typed at least 1 char after @
  if (!query.trim()) return null;

  return (
    <div
      data-mention-dropdown
      className="absolute z-50 mt-1 w-72 rounded-xl border border-border bg-popover shadow-lg overflow-hidden"
    >
      {loading && (
        <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Searching…
        </div>
      )}
      {!loading && searchError && (
        <div className="px-3 py-2.5 text-sm text-destructive">
          Could not reach server. Try again.
        </div>
      )}
      {!loading && !searchError && candidates.length === 0 && (
        <div className="px-3 py-2.5 text-sm text-muted-foreground">
          No users found for &ldquo;{query}&rdquo;
        </div>
      )}
      {!loading && candidates.map((u) => (
        <button
          key={u.id}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onSelect(u); }}
          className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
        >
          {u.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u.avatarUrl} alt={u.name} className="size-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="size-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 uppercase">
              {u.name.slice(0, 2)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium truncate">{u.name}</p>
            {(u.jobTitle || u.department) && (
              <p className="text-xs text-muted-foreground truncate">
                {[u.jobTitle, u.department].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

export function renderWithMentions(text: string) {
  const parts = text.split(/(@[\w ]+)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="text-primary font-medium">{part}</span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export function MentionTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  autoFocus,
  className,
  onKeyDown,
  singleLine = false,
}: Props) {
  const { mention, candidates, loading, searchError, handleChange, selectUser, dismiss } =
    useMention(value, onChange);
  const inputRef = React.useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  const onInput = (
    e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>
  ) => {
    const el = e.target;
    handleChange(el.value, el.selectionStart ?? el.value.length);
  };

  const showDropdown = mention.active && mention.query.trim().length > 0;

  const commonProps = {
    value,
    onChange: onInput,
    placeholder,
    autoFocus,
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement & HTMLInputElement>) => {
      if (e.key === "Escape" && mention.active) { dismiss(); return; }
      onKeyDown?.(e as never);
    },
  };

  const baseClass = cn(
    "w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground resize-none",
    className
  );

  return (
    <div className="relative w-full">
      {singleLine ? (
        <input
          {...commonProps}
          ref={inputRef as React.Ref<HTMLInputElement>}
          type="text"
          className={cn(baseClass, "flex-1")}
        />
      ) : (
        <textarea
          {...commonProps}
          ref={inputRef as React.Ref<HTMLTextAreaElement>}
          rows={rows}
          className={baseClass}
        />
      )}
      {showDropdown && (
        <MentionDropdown
          candidates={candidates}
          query={mention.query}
          loading={loading}
          searchError={searchError}
          onSelect={(u) => { selectUser(u); inputRef.current?.focus(); }}
          onDismiss={dismiss}
        />
      )}
    </div>
  );
}
