"use client";

import { useState, useEffect, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { createClient } from "@/lib/supabase";

interface CalendarProps {
  userId: string;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function GratitudeCalendar({
  userId,
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const [entryCounts, setEntryCounts] = useState<Record<string, number>>({});
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    let cancelled = false;

    const fetchMonthData = async () => {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      const { data } = await supabaseRef.current
        .from("gratitude_entries")
        .select("date")
        .eq("user_id", userId)
        .gte("date", start)
        .lte("date", end);

      if (cancelled) return;

      const counts: Record<string, number> = {};
      data?.forEach((entry) => {
        counts[entry.date] = (counts[entry.date] || 0) + 1;
      });
      setEntryCounts(counts);
    };

    fetchMonthData();
    return () => { cancelled = true; };
  }, [userId, currentMonth]);

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
        >
          ◀
        </button>
        <h3 className="font-bold text-amber-900">
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
        >
          ▶
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-amber-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const dateStr = format(d, "yyyy-MM-dd");
          const count = entryCounts[dateStr] || 0;
          const isCurrentMonth = isSameMonth(d, currentMonth);
          const isSelected = isSameDay(d, selectedDate);
          const isToday = isSameDay(d, new Date());

          return (
            <button
              key={i}
              onClick={() => onSelectDate(d)}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition ${
                !isCurrentMonth
                  ? "text-gray-300"
                  : isSelected
                  ? "bg-amber-500 text-white"
                  : isToday
                  ? "bg-amber-100 text-amber-900 font-bold"
                  : "text-amber-900 hover:bg-amber-50"
              }`}
            >
              {format(d, "d")}
              {count > 0 && isCurrentMonth && (
                <div
                  className={`absolute bottom-0.5 flex gap-0.5 ${
                    isSelected ? "opacity-80" : ""
                  }`}
                >
                  {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                    <div
                      key={j}
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? "bg-white" : "bg-amber-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
