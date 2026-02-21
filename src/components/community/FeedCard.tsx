"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { ReactionType } from "@/types/database";
import { REACTION_EMOJI } from "@/types/database";
import type { FeedEntry } from "@/hooks/useCommunityFeed";
import CommentSection from "./CommentSection";

interface FeedCardProps {
  entry: FeedEntry;
  currentUserId?: string;
  onReaction: (entryId: string, type: ReactionType) => void;
  onShare: (entry: FeedEntry) => void;
}

const reactionTypes: ReactionType[] = ["like", "cheer", "pray", "heart"];

export default function FeedCard({
  entry,
  currentUserId,
  onReaction,
  onShare,
}: FeedCardProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm">
          {entry.profiles?.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={entry.profiles.avatar_url}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            entry.profiles?.nickname?.[0] || "?"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900 truncate">
            {entry.profiles?.nickname || "익명"}
          </p>
          <p className="text-xs text-amber-400">
            {formatDistanceToNow(new Date(entry.created_at), {
              addSuffix: true,
              locale: ko,
            })}
          </p>
        </div>
      </div>

      {/* 내용 */}
      <div className="px-4 py-3">
        <p className="text-amber-900">{entry.discovery}</p>
        {entry.reason && (
          <p className="text-amber-600 text-sm mt-1.5">{entry.reason}</p>
        )}
      </div>

      {/* 리액션 바 */}
      <div className="px-4 pb-2 flex items-center gap-1 flex-wrap">
        {reactionTypes.map((type) => {
          const count = entry.reaction_counts[type];
          const isActive = entry.my_reactions.includes(type);
          return (
            <button
              key={type}
              onClick={() => onReaction(entry.id, type)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition ${
                isActive
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <span>{REACTION_EMOJI[type]}</span>
              {count > 0 && <span className="text-xs">{count}</span>}
            </button>
          );
        })}

        <button
          onClick={() => setShowComments(!showComments)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-gray-50 text-gray-500 hover:bg-gray-100 ml-auto"
        >
          💬{" "}
          {entry.comment_count > 0 && (
            <span className="text-xs">{entry.comment_count}</span>
          )}
        </button>

        <button
          onClick={() => onShare(entry)}
          className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-gray-50 text-gray-500 hover:bg-gray-100"
        >
          🔗
        </button>
      </div>

      {/* 댓글 섹션 */}
      {showComments && (
        <CommentSection entryId={entry.id} currentUserId={currentUserId} />
      )}
    </div>
  );
}
