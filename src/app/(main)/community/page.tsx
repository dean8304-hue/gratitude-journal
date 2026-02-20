"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useCommunityFeed } from "@/hooks/useCommunityFeed";
import type { FeedEntry } from "@/hooks/useCommunityFeed";
import FeedCard from "@/components/community/FeedCard";

export default function CommunityPage() {
  const { user } = useAuth();
  const { entries, loading, toggleReaction } = useCommunityFeed(user?.id);

  const handleShare = async (entry: FeedEntry) => {
    const shareUrl = `${window.location.origin}/share/${entry.id}`;
    const shareData = {
      title: "감사일기",
      text: `${entry.profiles?.nickname}님의 감사: ${entry.discovery}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // 사용자가 취소한 경우
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("링크가 복사되었습니다!");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🌍</span>
        <h2 className="text-lg font-bold text-amber-900">커뮤니티</h2>
      </div>

      {loading ? (
        <div className="text-center py-12 text-amber-400">불러오는 중...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-amber-700 font-medium">
            아직 공유된 감사가 없어요
          </p>
          <p className="text-amber-500 text-sm mt-1">
            감사 목록에서 항목을 공유해보세요
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <FeedCard
              key={entry.id}
              entry={entry}
              currentUserId={user?.id}
              onReaction={toggleReaction}
              onShare={handleShare}
            />
          ))}
        </div>
      )}
    </div>
  );
}
