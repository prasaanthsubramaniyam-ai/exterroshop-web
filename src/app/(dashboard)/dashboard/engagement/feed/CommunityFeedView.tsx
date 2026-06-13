"use client";

import * as React from "react";
import {
  Send, Image as ImageIcon, Smile, MessageCircle,
  Bookmark, MoreHorizontal, X, Loader2, ChevronDown,
  Trophy, Sparkles, Megaphone, Zap, Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { formatTimeAgo } from "@/utils/format";
import {
  communityFeedService,
  type CommunityPost,
  type PostComment,
  type ReactionType,
  type PostType,
} from "@/services/engagement.service";

// ── Reaction metadata ──────────────────────────────────────────────────────────

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "LIKE",       emoji: "👍", label: "Like"       },
  { type: "CLAP",       emoji: "👏", label: "Clap"       },
  { type: "CELEBRATE",  emoji: "🎉", label: "Celebrate"  },
  { type: "FIRE",       emoji: "🔥", label: "Fire"       },
  { type: "INSIGHTFUL", emoji: "💡", label: "Insightful" },
  { type: "LOVE",       emoji: "❤️", label: "Love"       },
];

const REACTION_EMOJI: Record<ReactionType, string> = {
  LIKE: "👍", CLAP: "👏", CELEBRATE: "🎉", FIRE: "🔥", INSIGHTFUL: "💡", LOVE: "❤️",
};

const POST_TYPE_META: Record<PostType, { icon: React.ElementType; label: string; color: string }> = {
  TEXT:             { icon: Smile,       label: "Update",      color: "text-gray-500"   },
  PHOTO:            { icon: ImageIcon,   label: "Photo",       color: "text-blue-500"   },
  VIDEO:            { icon: ImageIcon,   label: "Video",       color: "text-purple-500" },
  RECOGNITION:      { icon: Trophy,      label: "Recognition", color: "text-amber-500"  },
  MILESTONE:        { icon: Sparkles,    label: "Milestone",   color: "text-rose-500"   },
  ANNOUNCEMENT:     { icon: Megaphone,   label: "Announcement",color: "text-primary"    },
  POLL_SHARE:       { icon: Zap,         label: "Poll",        color: "text-violet-500" },
  ACHIEVEMENT_SHARE:{ icon: Lightbulb,   label: "Achievement", color: "text-emerald-500"},
};

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, avatarUrl, size = 36 }: { name: string; avatarUrl?: string | null; size?: number }) {
  const s = `size-${size === 36 ? "9" : size === 32 ? "8" : "10"}`;
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt={name} className={`${s} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${s} rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 uppercase`}>
      {name.slice(0, 2)}
    </div>
  );
}

// ── Reaction Bar ──────────────────────────────────────────────────────────────

function ReactionBar({ post, onToggle }: {
  post: CommunityPost;
  onToggle: (reaction: ReactionType) => void;
}) {
  const [showPicker, setShowPicker] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowPicker(false);
    };
    if (showPicker) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker]);

  return (
    <div className="relative" ref={ref}>
      <button
        onMouseEnter={() => setShowPicker(true)}
        onClick={() => onToggle(post.myReaction ?? "LIKE")}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          post.reacted
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        <span>{post.myReaction ? REACTION_EMOJI[post.myReaction] : "👍"}</span>
        <span>{post.reacted ? (post.myReaction ? post.myReaction.charAt(0) + post.myReaction.slice(1).toLowerCase() : "Like") : "Like"}</span>
      </button>

      {showPicker && (
        <div
          className="absolute bottom-full left-0 mb-1 flex items-center gap-1 rounded-2xl border border-border bg-card px-2 py-1.5 shadow-xl z-20"
          onMouseLeave={() => setShowPicker(false)}
        >
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              onClick={() => { onToggle(r.type); setShowPicker(false); }}
              className="text-xl transition-transform hover:scale-125 active:scale-110 p-1 rounded-lg hover:bg-muted"
              title={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Comment Input ─────────────────────────────────────────────────────────────

function CommentInput({ postId, onAdded, parentId }: {
  postId: number;
  onAdded: (c: PostComment) => void;
  parentId?: number;
}) {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [text, setText] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const comment = await communityFeedService.addComment(postId, text.trim(), parentId);
      onAdded(comment);
      setText("");
    } catch {
      dispatch(pushToast({ title: "Failed to post comment", variant: "destructive" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Avatar name={user?.name ?? "?"} avatarUrl={user?.avatarUrl} size={32} />
      <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-muted/30 px-3 py-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }}}
          placeholder="Write a comment…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={submit}
          disabled={saving || !text.trim()}
          className="text-primary disabled:opacity-40"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────

function PostCard({ post, onUpdate }: {
  post: CommunityPost;
  onUpdate: (updated: CommunityPost) => void;
}) {
  const dispatch = useAppDispatch();
  const [showComments, setShowComments] = React.useState(false);
  const [comments, setComments] = React.useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = React.useState(false);
  const [reacting, setReacting] = React.useState(false);
  const [bookmarking, setBookmarking] = React.useState(false);

  const typeMeta = POST_TYPE_META[post.postType as PostType] ?? POST_TYPE_META.TEXT;
  const TypeIcon = typeMeta.icon;

  const handleReaction = async (reaction: ReactionType) => {
    if (reacting) return;
    setReacting(true);
    try {
      const res = await communityFeedService.toggleReaction(post.id, reaction);
      onUpdate({
        ...post,
        reacted: res.reacted,
        myReaction: res.reacted ? res.reaction : null,
        reactionCount: post.reactionCount + (res.reacted ? 1 : -1),
      });
    } catch {
      dispatch(pushToast({ title: "Failed to react", variant: "destructive" }));
    } finally {
      setReacting(false);
    }
  };

  const handleBookmark = async () => {
    if (bookmarking) return;
    setBookmarking(true);
    try {
      const bookmarked = await communityFeedService.toggleBookmark(post.id);
      onUpdate({ ...post, bookmarked });
      dispatch(pushToast({ title: bookmarked ? "Post saved" : "Bookmark removed" }));
    } catch {
      dispatch(pushToast({ title: "Failed to bookmark", variant: "destructive" }));
    } finally {
      setBookmarking(false);
    }
  };

  const loadComments = async () => {
    if (commentsLoading) return;
    setCommentsLoading(true);
    try {
      const data = await communityFeedService.getComments(post.id);
      setComments(data);
    } catch {
      /* silent */
    } finally {
      setCommentsLoading(false);
    }
  };

  const toggleComments = () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) loadComments();
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <Avatar name={post.authorName} avatarUrl={post.authorAvatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{post.authorName}</span>
            {post.postType !== "TEXT" && (
              <span className={cn("flex items-center gap-0.5 text-[10px] font-medium", typeMeta.color)}>
                <TypeIcon className="size-3" />{typeMeta.label}
              </span>
            )}
            {post.pinned && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Pinned</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
        </div>
        <button className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <p className="px-4 pb-3 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      )}

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className={cn("grid gap-1 px-4 pb-3", post.mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
          {post.mediaUrls.slice(0, 4).map((url, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl bg-muted aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              {i === 3 && post.mediaUrls!.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/50 text-white font-bold text-lg">
                  +{post.mediaUrls!.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reaction summary */}
      {post.reactionCount > 0 && (
        <div className="mx-4 mb-2 flex items-center gap-1 border-b border-border/50 pb-2">
          <div className="flex -space-x-0.5">
            {["👍","👏","🎉"].slice(0, 3).map((e, i) => (
              <span key={i} className="text-sm">{e}</span>
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-1">{post.reactionCount.toLocaleString()}</span>
          {post.commentCount > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">{post.commentCount} comment{post.commentCount !== 1 ? "s" : ""}</span>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 px-3 py-1 border-t border-border/60">
        <ReactionBar post={post} onToggle={handleReaction} />

        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <MessageCircle className="size-4" />
          <span>Comment</span>
        </button>

        <button
          onClick={handleBookmark}
          className={cn(
            "ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
            post.bookmarked ? "text-primary" : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Bookmark className={cn("size-4", post.bookmarked && "fill-primary")} />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-4 py-3 border-t border-border/50 space-y-3 bg-muted/20">
          <CommentInput
            postId={post.id}
            onAdded={(c) => {
              setComments((prev) => [c, ...prev]);
              onUpdate({ ...post, commentCount: post.commentCount + 1 });
            }}
          />
          {commentsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            comments.map((c) => (
              <CommentItem key={c.id} comment={c} postId={post.id} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, postId }: { comment: PostComment; postId: number }) {
  const [showReply, setShowReply] = React.useState(false);
  const [replies, setReplies] = React.useState(comment.replies ?? []);

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <Avatar name={comment.authorName} avatarUrl={comment.authorAvatarUrl} size={32} />
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl bg-card border border-border/50 px-3 py-2">
            <p className="text-xs font-semibold">{comment.authorName}</p>
            <p className="text-sm mt-0.5">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 px-1">
            <span className="text-[10px] text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
            <button onClick={() => setShowReply((s) => !s)} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground">
              Reply
            </button>
          </div>
        </div>
      </div>
      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="ml-10 space-y-2">
          {replies.map((r) => (
            <div key={r.id} className="flex items-start gap-2">
              <Avatar name={r.authorName} avatarUrl={r.authorAvatarUrl} size={32} />
              <div className="rounded-2xl bg-card border border-border/50 px-3 py-2 flex-1">
                <p className="text-xs font-semibold">{r.authorName}</p>
                <p className="text-sm mt-0.5">{r.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {showReply && (
        <div className="ml-10">
          <CommentInput
            postId={postId}
            parentId={comment.id}
            onAdded={(c) => {
              setReplies((prev) => [...prev, c]);
              setShowReply(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Post Composer ─────────────────────────────────────────────────────────────

const POST_TYPES: { type: PostType; emoji: string; label: string }[] = [
  { type: "TEXT",         emoji: "📝", label: "Update"      },
  { type: "PHOTO",        emoji: "📸", label: "Photo"       },
  { type: "RECOGNITION",  emoji: "🏆", label: "Recognition" },
  { type: "MILESTONE",    emoji: "🎉", label: "Milestone"   },
  { type: "ANNOUNCEMENT", emoji: "📢", label: "Announcement"},
];

function PostComposer({ onPosted }: { onPosted: (post: CommunityPost) => void }) {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [open, setOpen] = React.useState(false);
  const [postType, setPostType] = React.useState<PostType>("TEXT");
  const [content, setContent] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const submit = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const post = await communityFeedService.createPost({ postType, content: content.trim() });
      onPosted(post);
      setContent("");
      setOpen(false);
      dispatch(pushToast({ title: "Post shared!" }));
    } catch {
      dispatch(pushToast({ title: "Failed to post", variant: "destructive" }));
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm text-muted-foreground hover:border-primary/30 hover:bg-muted/30 transition-all"
      >
        <Avatar name={user?.name ?? "?"} avatarUrl={user?.avatarUrl} size={36} />
        <span>What&apos;s on your mind, {user?.name?.split(" ")[0]}?</span>
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span>📸</span><span>🏆</span><span>🎉</span>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar name={user?.name ?? "?"} avatarUrl={user?.avatarUrl} size={36} />
          <div>
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-muted-foreground">Sharing with everyone</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="size-5" />
        </button>
      </div>

      {/* Post type selector */}
      <div className="flex gap-1.5 flex-wrap">
        {POST_TYPES.map((t) => (
          <button
            key={t.type}
            onClick={() => setPostType(t.type)}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              postType === t.type
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <textarea
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          postType === "RECOGNITION" ? "Who are you recognizing and why?" :
          postType === "MILESTONE"   ? "What milestone are you celebrating?" :
          postType === "ANNOUNCEMENT"? "What would you like to announce?" :
          "Share an update with your team…"
        }
        rows={3}
        className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />

      <div className="flex items-center justify-between border-t border-border/50 pt-3">
        <div className="flex gap-2">
          <button className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted">
            <ImageIcon className="size-3.5" /> Photo
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving || !content.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Feed View ─────────────────────────────────────────────────────────────

export function CommunityFeedView() {
  const dispatch = useAppDispatch();
  const [posts, setPosts] = React.useState<CommunityPost[]>([]);
  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const load = React.useCallback(async (p: number, append = false) => {
    if (p === 0) setLoading(true); else setLoadingMore(true);
    try {
      const result = await communityFeedService.getFeed(p, 15);
      setPosts((prev) => append ? [...prev, ...result.content] : result.content);
      setTotalPages(result.totalPages);
      setPage(p);
    } catch {
      dispatch(pushToast({ title: "Could not load feed", variant: "destructive" }));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [dispatch]);

  React.useEffect(() => { load(0); }, [load]);

  const handleUpdate = (updated: CommunityPost) => {
    setPosts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PostComposer onPosted={(p) => setPosts((prev) => [p, ...prev])} />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-32 rounded bg-muted" />
                  <div className="h-2.5 w-20 rounded bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 rounded bg-muted" />
                <div className="h-3 w-3/4 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center">
          <Sparkles className="mx-auto mb-3 size-10 text-muted-foreground/30" />
          <p className="font-semibold">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Be the first to share something with your team.</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={handleUpdate} />
          ))}

          {page + 1 < totalPages && (
            <div className="flex justify-center pb-4">
              <button
                onClick={() => load(page + 1, true)}
                disabled={loadingMore}
                className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
              >
                {loadingMore ? <Loader2 className="size-4 animate-spin" /> : <ChevronDown className="size-4" />}
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
