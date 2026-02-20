"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGratitudeEntries } from "@/hooks/useGratitudeEntries";
import { getMaxGratitudeCount, getProgressMessage } from "@/utils/gratitude";
import GratitudeForm from "@/components/journal/GratitudeForm";
import GratitudeItem from "@/components/journal/GratitudeItem";
import GratitudeCalendar from "@/components/journal/GratitudeCalendar";

export default function JournalPage() {
  const { user, profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const { entries, loading, addEntry, updateEntry, deleteEntry, togglePublic } =
    useGratitudeEntries(user?.id, selectedDate);

  const maxCount = profile
    ? getMaxGratitudeCount(profile.joined_at)
    : 3;
  const canAdd = entries.length < maxCount;

  return (
    <div className="space-y-4">
      {/* 진행 상태 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-amber-800">
            오늘의 감사
          </span>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-sm text-amber-500 hover:text-amber-600"
          >
            {showCalendar ? "목록 보기" : "캘린더 보기"}
          </button>
        </div>

        {/* 프로그레스 바 */}
        <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((entries.length / maxCount) * 100, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-amber-600">
            {entries.length} / {maxCount}
          </span>
          <span className="text-xs text-amber-500">
            {getProgressMessage(entries.length, maxCount)}
          </span>
        </div>
      </div>

      {/* 캘린더 */}
      {showCalendar && user && (
        <GratitudeCalendar
          userId={user.id}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setShowCalendar(false);
          }}
        />
      )}

      {/* 입력 폼 */}
      {canAdd && (
        <GratitudeForm
          onSubmit={async (discovery, reason) => {
            await addEntry(discovery, reason);
          }}
          disabled={!canAdd}
        />
      )}

      {/* 감사 목록 */}
      {loading ? (
        <div className="text-center py-8 text-amber-400">불러오는 중...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🌅</div>
          <p className="text-amber-700 font-medium">아직 감사 항목이 없어요</p>
          <p className="text-amber-500 text-sm mt-1">
            위에서 오늘 감사한 것을 적어보세요
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <GratitudeItem
              key={entry.id}
              entry={entry}
              index={i}
              onUpdate={async (id, d, r) => {
                await updateEntry(id, d, r);
              }}
              onDelete={async (id) => {
                await deleteEntry(id);
              }}
              onTogglePublic={async (id, pub) => {
                await togglePublic(id, pub);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
