"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Comment, Profile } from "@/types/database";

interface CommentWithProfile extends Comment {
  profiles: Pick<Profile, "nickname" | "avatar_url">;
}

interface CommentSectionProps {
  entryId: string;
  currentUserId?: string;
}

export default function CommentSection({
  entryId,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const supabaseRef = useRef(createClient());

  const fetchComments = useCallback(async () => {
    const { data } = await supabaseRef.current
      .from("comments")
      .select("*, profiles:user_id(nickname, avatar_url)")
      .eq("entry_id", entryId)
      .order("created_at");

    setComments(
      (data as unknown as CommentWithProfile[]) || []
    );
    setLoading(false);
  }, [entryId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabaseRef.current
        .from("comments")
        .select("*, profiles:user_id(nickname, avatar_url)")
        .eq("entry_id", entryId)
        .order("created_at");

      if (!cancelled) {
        setComments((data as unknown as CommentWithProfile[]) || []);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [entryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId || submitting) return;

    setSubmitting(true);
    await supabaseRef.current.from("comments").insert({
      user_id: currentUserId,
      entry_id: entryId,
      content: newComment.trim(),
    });

    setNewComment("");
    setSubmitting(false);
    await fetchComments();
  };

  const handleDelete = async (commentId: string) => {
    await supabaseRef.current.from("comments").delete().eq("id", commentId);
    await fetchComments();
  };

  return (
    <div className="border-t border-amber-50 px-4 py-3 space-y-3">
      {loading ? (
        <p className="text-xs text-amber-400 text-center">불러오는 중...</p>
      ) : (
        <>
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                {comment.profiles?.nickname?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-amber-900">
                    {comment.profiles?.nickname || "익명"}
                  </span>
                  <span className="text-xs text-amber-400">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                  {comment.user_id === currentUserId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-red-400 hover:text-red-500 ml-auto"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p className="text-sm text-amber-800">{comment.content}</p>
              </div>
            </div>
          ))}
        </>
      )}

      {/* 댓글 입력 */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 남겨보세요..."
            className="flex-1 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-300"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="px-3 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            전송
          </button>
        </form>
      )}
    </div>
  );
}
