import * as React from "react";
import client from "@/services/api";

export interface MentionUser {
  id: number;
  name: string;
  avatarUrl?: string | null;
  jobTitle?: string | null;
  department?: string | null;
}

interface MentionState {
  active: boolean;
  query: string;
  startIndex: number;
}

const IDLE: MentionState = { active: false, query: "", startIndex: -1 };

export function useMention(value: string, onChange: (v: string) => void) {
  const [mention, setMention] = React.useState<MentionState>(IDLE);
  const [candidates, setCandidates] = React.useState<MentionUser[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = React.useCallback(
    (text: string, caretPos: number) => {
      onChange(text);

      // Find the last @ before caret that isn't followed by a newline
      const slice = text.slice(0, caretPos);
      const atIdx = slice.lastIndexOf("@");
      if (atIdx === -1) { setMention(IDLE); return; }

      const afterAt = slice.slice(atIdx + 1);

      // Dismiss if the text after @ contains a newline
      if (afterAt.includes("\n")) { setMention(IDLE); return; }

      setMention({ active: true, query: afterAt, startIndex: atIdx });
      setSearchError(false);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const trimmed = afterAt.trim();
        if (!trimmed) {
          setCandidates([]);
          return;
        }
        setLoading(true);
        try {
          const res = await client.get<{ data: MentionUser[] }>(`/users/search?q=${encodeURIComponent(trimmed)}`);
          const list = res.data?.data;
          setCandidates(Array.isArray(list) ? list : []);
        } catch (err) {
          console.error("[mention] search failed:", err);
          setSearchError(true);
          setCandidates([]);
        } finally {
          setLoading(false);
        }
      }, 200);
    },
    [onChange]
  );

  const selectUser = React.useCallback(
    (user: MentionUser) => {
      if (mention.startIndex === -1) return;
      const before = value.slice(0, mention.startIndex);
      const after = value.slice(mention.startIndex + 1 + mention.query.length);
      onChange(`${before}@${user.name}${after.startsWith(" ") ? "" : " "}${after}`);
      setMention(IDLE);
      setCandidates([]);
      setSearchError(false);
    },
    [value, mention, onChange]
  );

  const dismiss = React.useCallback(() => {
    setMention(IDLE);
    setCandidates([]);
    setSearchError(false);
  }, []);

  return { mention, candidates, loading, searchError, handleChange, selectUser, dismiss };
}
