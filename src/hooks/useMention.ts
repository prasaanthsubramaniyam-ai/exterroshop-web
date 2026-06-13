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
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = React.useCallback(
    (text: string, caretPos: number) => {
      onChange(text);

      // Find the last @ before caret
      const slice = text.slice(0, caretPos);
      const atIdx = slice.lastIndexOf("@");
      if (atIdx === -1) { setMention(IDLE); return; }

      const afterAt = slice.slice(atIdx + 1);
      // Only activate if no space in the query (single-word trigger)
      if (/\s/.test(afterAt) && afterAt.length > 0 && !afterAt.match(/^[\w ]{1,40}$/)) {
        setMention(IDLE);
        return;
      }

      setMention({ active: true, query: afterAt, startIndex: atIdx });

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (!afterAt.trim()) { setCandidates([]); return; }
        setLoading(true);
        try {
          const res = await client.get<{ data: MentionUser[] }>(`/users/search?q=${encodeURIComponent(afterAt)}`);
          setCandidates(res.data.data ?? []);
        } catch {
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
    },
    [value, mention, onChange]
  );

  const dismiss = React.useCallback(() => {
    setMention(IDLE);
    setCandidates([]);
  }, []);

  return { mention, candidates, loading, handleChange, selectUser, dismiss };
}
