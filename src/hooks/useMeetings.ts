"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { Meeting } from "@/types/database";

interface MeetingForm {
  name: string;
  day_of_week: string;
  time: string;
  location_name: string;
  address: string;
  contact_name: string;
  contact_phone: string;
  description: string;
}

export function useMeetings(userId?: string) {
  const supabase = createClient();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("meetings")
      .select("*")
      .eq("is_active", true)
      .order("day_of_week")
      .order("time");

    setMeetings(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const addMeeting = async (form: MeetingForm) => {
    if (!userId) return;
    const { error } = await supabase.from("meetings").insert({
      ...form,
      created_by: userId,
    });
    if (!error) await fetchMeetings();
    return error;
  };

  const updateMeeting = async (id: string, form: MeetingForm) => {
    if (!userId) return;
    const { error } = await supabase
      .from("meetings")
      .update(form)
      .eq("id", id)
      .eq("created_by", userId);
    if (!error) await fetchMeetings();
    return error;
  };

  const deleteMeeting = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("meetings")
      .delete()
      .eq("id", id)
      .eq("created_by", userId);
    if (!error) await fetchMeetings();
    return error;
  };

  return { meetings, loading, addMeeting, updateMeeting, deleteMeeting, refresh: fetchMeetings };
}
