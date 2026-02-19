"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { GratitudeEntry, Profile, ReactionType } from "@/types/database";

export interface FeedEntry extends GratitudeEntry {
  profiles: Pick<Profile, "nickname" | "avatar_url">;
  reaction_counts: Record<ReactionType, number>;
  my_reactions: ReactionType[];
  comment_count: number;
}

export function useCommunityFeed(userId: string | undefined) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchFeed = useCallback(async () => {
    setLoading(true);

    // 공개 감사 항목 + 프로필 정보
    const { data: rawEntries } = await supabase
      .from("gratitude_entries")
      .select("*, profiles:user_id(nickname, avatar_url)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!rawEntries) {
      setEntries([]);
      setLoading(false);
      return;
    }

    // 리액션 수 집계
    const entryIds = rawEntries.map((e) => e.id);

    const { data: reactions } = await supabase
      .from("reactions")
      .select("entry_id, type, user_id")
      .in("entry_id", entryIds);

    // 댓글 수 집계
    const { data: comments } = await supabase
      .from("comments")
      .select("entry_id")
      .in("entry_id", entryIds);

    const feedEntries: FeedEntry[] = rawEntries.map((entry) => {
      const entryReactions = reactions?.filter((r) => r.entry_id === entry.id) || [];
      const reactionCounts: Record<ReactionType, number> = {
        like: 0,
        cheer: 0,
        pray: 0,
        heart: 0,
      };
      const myReactions: ReactionType[] = [];

      entryReactions.forEach((r) => {
        reactionCounts[r.type as ReactionType]++;
        if (r.user_id === userId) {
          myReactions.push(r.type as ReactionType);
        }
      });

      const commentCount = comments?.filter((c) => c.entry_id === entry.id).length || 0;

      return {
        ...entry,
        profiles: entry.profiles as unknown as Pick<Profile, "nickname" | "avatar_url">,
        reaction_counts: reactionCounts,
        my_reactions: myReactions,
        comment_count: commentCount,
      };
    });

    setEntries(feedEntries);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const toggleReaction = async (entryId: string, type: ReactionType) => {
    if (!userId) return;

    const existing = entries
      .find((e) => e.id === entryId)
      ?.my_reactions.includes(type);

    if (existing) {
      await supabase
        .from("reactions")
        .delete()
        .eq("user_id", userId)
        .eq("entry_id", entryId)
        .eq("type", type);
    } else {
      await supabase
        .from("reactions")
        .insert({ user_id: userId, entry_id: entryId, type });
    }

    await fetchFeed();
  };

  return { entries, loading, toggleReaction, refreshFeed: fetchFeed };
}
