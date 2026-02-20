"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { GratitudeEntry } from "@/types/database";
import { format } from "date-fns";

export function useGratitudeEntries(userId: string | undefined, date: Date) {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const dateStr = format(date, "yyyy-MM-dd");

  const fetchEntries = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("gratitude_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("date", dateStr)
      .order("order_index");
    setEntries(data || []);
    setLoading(false);
  }, [userId, dateStr]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // 실시간 구독
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`gratitude-${userId}-${dateStr}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gratitude_entries",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, dateStr, fetchEntries]);

  const addEntry = async (discovery: string, reason: string) => {
    if (!userId) return;
    const { error } = await supabase.from("gratitude_entries").insert({
      user_id: userId,
      date: dateStr,
      discovery,
      reason,
      order_index: entries.length,
    });
    if (!error) await fetchEntries();
    return error;
  };

  const updateEntry = async (
    id: string,
    discovery: string,
    reason: string
  ) => {
    const { error } = await supabase
      .from("gratitude_entries")
      .update({ discovery, reason })
      .eq("id", id);
    if (!error) await fetchEntries();
    return error;
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from("gratitude_entries")
      .delete()
      .eq("id", id);
    if (!error) await fetchEntries();
    return error;
  };

  const togglePublic = async (id: string, isPublic: boolean) => {
    const { error } = await supabase
      .from("gratitude_entries")
      .update({ is_public: isPublic })
      .eq("id", id);
    if (!error) await fetchEntries();
    return error;
  };

  return { entries, loading, addEntry, updateEntry, deleteEntry, togglePublic };
}
