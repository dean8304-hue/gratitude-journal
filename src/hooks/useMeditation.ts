"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { MeditationReflection } from "@/types/database";
import { format } from "date-fns";

export interface MeditationData {
  date: string;
  title_en: string;
  title_ko: string;
  quote_en: string;
  quote_ko: string;
  source_en: string;
  source_ko: string;
  body_en: string;
  body_ko: string;
}

export interface SavePayload {
  reflection?: string;
  prayer?: string;
  memo?: string;
}

const MEDITATION_CACHE_KEY = "meditation-cache";

function getCachedMeditation(dateStr: string): MeditationData | null {
  try {
    const raw = sessionStorage.getItem(MEDITATION_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as MeditationData;
    if (data.date === dateStr) return data;
  } catch {}
  return null;
}

function setCachedMeditation(data: MeditationData) {
  try {
    sessionStorage.setItem(MEDITATION_CACHE_KEY, JSON.stringify(data));
  } catch {}
}

export function useMeditation(userId: string | undefined) {
  const [meditation, setMeditation] = useState<MeditationData | null>(null);
  const [savedReflection, setSavedReflection] =
    useState<MeditationReflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const supabaseRef = useRef(createClient());
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setError(false);

      // 클라이언트 캐시 확인
      const cached = getCachedMeditation(today);

      const meditationPromise = cached
        ? Promise.resolve().then(() => {
            if (!cancelled) setMeditation(cached);
          })
        : fetch("/api/meditation")
            .then((res) => {
              if (!res.ok) throw new Error("fetch failed");
              return res.json();
            })
            .then((data) => {
              if (data.error) throw new Error(data.error);
              if (!cancelled) {
                setMeditation(data);
                setCachedMeditation(data);
              }
            })
            .catch(() => {
              if (!cancelled) setError(true);
            });

      const reflectionPromise = userId
        ? (async () => {
            try {
              const { data } = await supabaseRef.current
                .from("meditation_reflections")
                .select("*")
                .eq("user_id", userId)
                .eq("date", today)
                .single();
              if (!cancelled) setSavedReflection(data);
            } catch {}
          })()
        : Promise.resolve();

      await Promise.all([meditationPromise, reflectionPromise]);
      if (!cancelled) setLoading(false);
    };

    fetchAll();
    return () => { cancelled = true; };
  }, [userId, today]);

  const saveReflection = useCallback(async (payload: SavePayload) => {
    if (!userId || !meditation) return;

    const record = {
      user_id: userId,
      date: today,
      jft_title: meditation.title_ko || meditation.title_en,
      jft_content: meditation.body_ko || meditation.body_en,
      reflection: payload.reflection ?? null,
      prayer: payload.prayer ?? null,
      memo: payload.memo ?? null,
    };

    if (savedReflection) {
      const { data, error } = await supabaseRef.current
        .from("meditation_reflections")
        .update(record)
        .eq("id", savedReflection.id)
        .select()
        .single();
      if (!error && data) setSavedReflection(data);
      return error;
    } else {
      const { data, error } = await supabaseRef.current
        .from("meditation_reflections")
        .insert(record)
        .select()
        .single();
      if (!error && data) setSavedReflection(data);
      return error;
    }
  }, [userId, today, meditation, savedReflection]);

  return { meditation, savedReflection, loading, error, saveReflection };
}
