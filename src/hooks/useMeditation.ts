"use client";

import { useState, useEffect } from "react";
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

export function useMeditation(userId: string | undefined) {
  const [meditation, setMeditation] = useState<MeditationData | null>(null);
  const [savedReflection, setSavedReflection] =
    useState<MeditationReflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const supabase = createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(false);

      // 명상 API 호출과 Supabase 조회를 병렬로 실행
      const meditationPromise = fetch("/api/meditation")
        .then((res) => {
          if (!res.ok) throw new Error("fetch failed");
          return res.json();
        })
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setMeditation(data);
        })
        .catch(() => setError(true));

      const reflectionPromise = userId
        ? (async () => {
            try {
              const { data } = await supabase
                .from("meditation_reflections")
                .select("*")
                .eq("user_id", userId)
                .eq("date", today)
                .single();
              setSavedReflection(data);
            } catch {}
          })()
        : Promise.resolve();

      await Promise.all([meditationPromise, reflectionPromise]);
      setLoading(false);
    };

    fetchAll();
  }, [userId, today]);

  const saveReflection = async (payload: SavePayload) => {
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
      const { data, error } = await supabase
        .from("meditation_reflections")
        .update(record)
        .eq("id", savedReflection.id)
        .select()
        .single();
      if (!error && data) setSavedReflection(data);
      return error;
    } else {
      const { data, error } = await supabase
        .from("meditation_reflections")
        .insert(record)
        .select()
        .single();
      if (!error && data) setSavedReflection(data);
      return error;
    }
  };

  return { meditation, savedReflection, loading, error, saveReflection };
}
