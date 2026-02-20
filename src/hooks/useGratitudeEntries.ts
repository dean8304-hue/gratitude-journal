"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase";
import type { GratitudeEntry } from "@/types/database";
import { format } from "date-fns";

export function useGratitudeEntries(userId: string | undefined, date: Date) {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const dateStr = format(date, "yyyy-MM-dd");

  const fetchEntries = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabaseRef.current
      .from("gratitude_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("date", dateStr)
      .order("order_index");
    setEntries(data || []);
    setLoading(false);
  }, [userId, dateStr]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!userId) return;
      setLoading(true);
      const { data } = await supabaseRef.current
        .from("gratitude_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("date", dateStr)
        .order("order_index");
      if (!cancelled) {
        setEntries(data || []);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId, dateStr]);

  const addEntry = useCallback(async (discovery: string, reason: string) => {
    if (!userId) return;
    const { error } = await supabaseRef.current.from("gratitude_entries").insert({
      user_id: userId,
      date: dateStr,
      discovery,
      reason,
      order_index: entries.length,
    });
    if (!error) await fetchEntries();
    return error;
  }, [userId, dateStr, entries.length, fetchEntries]);

  const updateEntry = useCallback(async (id: string, discovery: string, reason: string) => {
    const { error } = await supabaseRef.current
      .from("gratitude_entries")
      .update({ discovery, reason })
      .eq("id", id);
    if (!error) await fetchEntries();
    return error;
  }, [fetchEntries]);

  const deleteEntry = useCallback(async (id: string) => {
    const { error } = await supabaseRef.current
      .from("gratitude_entries")
      .delete()
      .eq("id", id);
    if (!error) await fetchEntries();
    return error;
  }, [fetchEntries]);

  const togglePublic = useCallback(async (id: string, isPublic: boolean) => {
    const { error } = await supabaseRef.current
      .from("gratitude_entries")
      .update({ is_public: isPublic })
      .eq("id", id);
    if (!error) await fetchEntries();
    return error;
  }, [fetchEntries]);

  return { entries, loading, addEntry, updateEntry, deleteEntry, togglePublic };
}
