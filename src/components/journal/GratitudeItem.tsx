"use client";

import { useState } from "react";
import type { GratitudeEntry } from "@/types/database";

interface GratitudeItemProps {
  entry: GratitudeEntry;
  index: number;
  onUpdate: (id: string, discovery: string, reason: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTogglePublic: (id: string, isPublic: boolean) => Promise<void>;
}

export default function GratitudeItem({
  entry,
  index,
  onUpdate,
  onDelete,
  onTogglePublic,
}: GratitudeItemProps) {
  const [editing, setEditing] = useState(false);
  const [discovery, setDiscovery] = useState(entry.discovery);
  const [reason, setReason] = useState(entry.reason || "");
  const [showMenu, setShowMenu] = useState(false);

  const handleSave = async () => {
    if (!discovery.trim()) return;
    await onUpdate(entry.id, discovery.trim(), reason.trim());
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-200">
        <textarea
          value={discovery}
          onChange={(e) => setDiscovery(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 resize-none mb-2"
        />
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="이유 (선택)"
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-300 resize-none mb-2"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium"
          >
            저장
          </button>
          <button
            onClick={() => {
              setDiscovery(entry.discovery);
              setReason(entry.reason || "");
              setEditing(false);
            }}
            className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium"
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 relative">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-amber-900 font-medium">{entry.discovery}</p>
          {entry.reason && (
            <p className="text-amber-600 text-sm mt-1">{entry.reason}</p>
          )}
        </div>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex-shrink-0 text-amber-400 hover:text-amber-600 p-1"
        >
          ···
        </button>
      </div>

      {showMenu && (
        <div className="absolute right-4 top-12 bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden z-10">
          <button
            onClick={() => {
              setEditing(true);
              setShowMenu(false);
            }}
            className="block w-full text-left px-4 py-2.5 text-sm text-amber-800 hover:bg-amber-50"
          >
            수정
          </button>
          <button
            onClick={() => {
              onTogglePublic(entry.id, !entry.is_public);
              setShowMenu(false);
            }}
            className="block w-full text-left px-4 py-2.5 text-sm text-amber-800 hover:bg-amber-50"
          >
            {entry.is_public ? "비공개로 전환" : "커뮤니티에 공유"}
          </button>
          <button
            onClick={() => {
              onDelete(entry.id);
              setShowMenu(false);
            }}
            className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      )}

      {entry.is_public && (
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-500">
          <span>🌐</span> 커뮤니티에 공유됨
        </div>
      )}
    </div>
  );
}
