"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Loader2,
  Send,
  Trash2,
  UsersRound,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/utils/format";
import {
  clubsService,
  type Club,
  type ClubPost,
} from "@/services/engagement.service";
import { clubTint } from "../clubColors";

const HR_ROLES = new Set(["HR", "MANAGER", "SUPER_ADMIN"]);

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function Avatar({ name, url, size = 9 }: { name: string; url: string | null; size?: number }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name} className={`size-${size} rounded-full object-cover`} />
  ) : (
    <div className={`flex size-${size} items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary`}>
      {initials(name)}
    </div>
  );
}

export function ClubDetailView({ clubId }: { clubId: number }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const isHr = !!user?.role && HR_ROLES.has(user.role);

  const [club, setClub] = React.useState<Club | null>(null);
  const [posts, setPosts] = React.useState<ClubPost[] | null>(null);
  const [draft, setDraft] = React.useState("");
  const [posting, setPosting] = React.useState(false);
  const [busy, setBusy] = React.useState<number | null>(null);

  const loadClub = React.useCallback(() => {
    clubsService.get(clubId).then(setClub).catch(() => router.replace("/dashboard/engagement/clubs"));
  }, [clubId, router]);

  const loadPosts = React.useCallback(() => {
    clubsService.posts(clubId).then(setPosts).catch(() => setPosts([]));
  }, [clubId]);

  React.useEffect(() => {
    loadClub();
    loadPosts();
  }, [loadClub, loadPosts]);

  const toggleJoin = async () => {
    if (!club) return;
    setBusy(-1);
    try {
      const updated = club.joinedByMe
        ? await clubsService.leave(clubId)
        : await clubsService.join(clubId);
      setClub(updated);
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't update membership",
        description: (err as Error).message,
        variant: "destructive",
      }));
    } finally {
      setBusy(null);
    }
  };

  const submitPost = async () => {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      const p = await clubsService.post(clubId, draft.trim());
      setPosts((prev) => [p, ...(prev ?? [])]);
      setDraft("");
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't post",
        description: (err as Error).message,
        variant: "destructive",
      }));
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (p: ClubPost) => {
    setBusy(p.id);
    try {
      const updated = await clubsService.toggleLike(p.id);
      setPosts((prev) => prev?.map((x) => x.id === updated.id ? updated : x) ?? null);
    } catch (err) {
      dispatch(pushToast({
        title: (err as Error).message,
        variant: "destructive",
      }));
    } finally {
      setBusy(null);
    }
  };

  const deletePost = async (p: ClubPost) => {
    if (!confirm("Delete this post?")) return;
    try {
      await clubsService.deletePost(p.id);
      setPosts((prev) => prev?.filter((x) => x.id !== p.id) ?? null);
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't delete",
        description: (err as Error).message,
        variant: "destructive",
      }));
    }
  };

  const deleteClub = async () => {
    if (!club) return;
    if (!confirm(`Delete "${club.name}" and all its posts? This can't be undone.`)) return;
    try {
      await clubsService.remove(clubId);
      dispatch(pushToast({ title: "Club deleted" }));
      router.replace("/dashboard/engagement/clubs");
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't delete",
        description: (err as Error).message,
        variant: "destructive",
      }));
    }
  };

  if (!club) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isAdmin = club.myRole === "ADMIN";
  const canDeleteClub = isAdmin || isHr;
  const canDeletePost = (p: ClubPost) => p.authorId === user?.id || isAdmin || isHr;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Back link */}
      <Link
        href="/dashboard/engagement/clubs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All clubs
      </Link>

      {/* Club header */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <div className={cn("flex size-14 items-center justify-center rounded-2xl text-3xl", clubTint(club.color))}>
            {club.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-bold">{club.name}</h1>
              {club.myRole === "ADMIN" && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Admin
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <UsersRound className="size-3.5" /> {club.memberCount} member{club.memberCount !== 1 ? "s" : ""}
              </span>
              <span>· started by {club.createdByName}</span>
            </div>
            {club.description && (
              <p className="mt-3 text-sm">{club.description}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Button
              size="sm"
              variant={club.joinedByMe ? "outline" : "default"}
              onClick={toggleJoin}
              loading={busy === -1}
            >
              {club.joinedByMe ? <><LogOut className="size-3.5" /> Leave</> : "Join club"}
            </Button>
            {canDeleteClub && (
              <button
                onClick={deleteClub}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Delete club
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Composer (members only) */}
      {club.joinedByMe && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder={`Share something with ${club.name}…`}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{draft.length}/2000</span>
            <Button size="sm" onClick={submitPost} loading={posting} disabled={!draft.trim()}>
              <Send className="size-3.5" /> Post
            </Button>
          </div>
        </div>
      )}

      {/* Feed */}
      {posts === null && (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {posts?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border py-12 text-center">
          <p className="text-sm font-medium">No posts yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {club.joinedByMe ? "Be the first to share something" : "Join the club to start the conversation"}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {posts?.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <Avatar name={p.authorName} url={p.authorAvatarUrl} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{p.authorName}</p>
                  <p className="text-xs text-muted-foreground">· {formatTimeAgo(p.createdAt)}</p>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm">{p.message}</p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleLike(p)}
                    disabled={!club.joinedByMe || busy === p.id}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                      p.likedByMe
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                        : "text-muted-foreground hover:bg-muted",
                      !club.joinedByMe && "cursor-not-allowed opacity-50"
                    )}
                    title={!club.joinedByMe ? "Join the club to react" : undefined}
                  >
                    <Heart className={cn("size-3.5", p.likedByMe && "fill-rose-600")} />
                    {p.likeCount}
                  </button>
                </div>
              </div>
              {canDeletePost(p) && (
                <button
                  onClick={() => deletePost(p)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
