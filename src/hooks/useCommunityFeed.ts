"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const supabaseRef = useRef(createClient());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    const supabase = supabaseRef.current;

    const { data: rawEntries } = await supabase
      .from("gratitude_entries")
      .select("*, profiles:user_id(nickname, avatar_url)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!mountedRef.current) return;

    if (!rawEntries) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const entryIds = rawEntries.map((e) => e.id);

    const [{ data: reactions }, { data: comments }] = await Promise.all([
      supabase.from("reactions").select("entry_id, type, user_id").in("entry_id", entryIds),
      supabase.from("comments").select("entry_id").in("entry_id", entryIds),
    ]);

    if (!mountedRef.current) return;

    const feedEntries: FeedEntry[] = rawEntries.map((entry) => {
      const entryReactions = reactions?.filter((r) => r.entry_id === entry.id) || [];
      const reactionCounts: Record<ReactionType, number> = {
        like: 0, cheer: 0, pray: 0, heart: 0,
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

  const toggleReaction = useCallback(async (entryId: string, type: ReactionType) => {
    if (!userId) return;
    const supabase = supabaseRef.current;

    // 낙관적 UI 업데이트
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== entryId) return e;
        const has = e.my_reactions.includes(type);
        return {
          ...e,
          my_reactions: has
            ? e.my_reactions.filter((r) => r !== type)
            : [...e.my_reactions, type],
          reaction_counts: {
            ...e.reaction_counts,
            [type]: e.reaction_counts[type] + (has ? -1 : 1),
          },
        };
      })
    );

    const existing = entries.find((e) => e.id === entryId)?.my_reactions.includes(type);

    if (existing) {
      await supabase.from("reactions").delete()
        .eq("user_id", userId).eq("entry_id", entryId).eq("type", type);
    } else {
      await supabase.from("reactions").insert({ user_id: userId, entry_id: entryId, type });
    }
  }, [userId, entries]);

  return { entries, loading, toggleReaction, refreshFeed: fetchFeed };
}
