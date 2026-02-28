"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMeetings } from "@/hooks/useMeetings";
import type { Meeting } from "@/types/database";

const DAYS = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];

const emptyForm = {
  name: "",
  day_of_week: "",
  time: "",
  location_name: "",
  address: "",
  contact_name: "",
  contact_phone: "",
  description: "",
};

export default function MeetingsPage() {
  const { user } = useAuth();
  const { meetings, loading, addMeeting, updateMeeting, deleteMeeting } =
    useMeetings(user?.id);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (meeting: Meeting) => {
    setForm({
      name: meeting.name,
      day_of_week: meeting.day_of_week || "",
      time: meeting.time || "",
      location_name: meeting.location_name || "",
      address: meeting.address || "",
      contact_name: meeting.contact_name || "",
      contact_phone: meeting.contact_phone || "",
      description: meeting.description || "",
    });
    setEditingId(meeting.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editingId) {
      await updateMeeting(editingId, form);
    } else {
      await addMeeting(form);
    }
    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMeeting(id);
    setConfirmDelete(null);
  };

  const openMap = (address: string) => {
    const encoded = encodeURIComponent(address);
    // 모바일: 카카오맵 우선, fallback 구글맵
    const kakaoUrl = `https://map.kakao.com/?q=${encoded}`;
    window.open(kakaoUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-amber-100 rounded w-1/3" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 space-y-3"
          >
            <div className="h-5 bg-amber-200 rounded w-2/3" />
            <div className="h-4 bg-amber-100 rounded w-1/2" />
            <div className="h-4 bg-amber-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-amber-900">NA 모임 안내</h1>
        <button
          onClick={openAdd}
          className="w-9 h-9 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center text-xl shadow-md transition"
          title="모임 추가"
        >
          +
        </button>
      </div>

      {/* 모임 목록 */}
      {meetings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-amber-700 font-medium">
            등록된 모임이 없습니다
          </p>
          <p className="text-amber-400 text-sm mt-1">
            &quot;+&quot; 버튼을 눌러 모임을 추가해보세요
          </p>
        </div>
      ) : (
        meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100"
          >
            {/* 모임 이름 */}
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-bold text-amber-900">
                {meeting.name}
              </h2>
              {user?.id === meeting.created_by && (
                <div className="flex gap-1.5 ml-2 shrink-0">
                  <button
                    onClick={() => openEdit(meeting)}
                    className="text-xs text-amber-500 hover:text-amber-600 px-2 py-1 rounded-lg hover:bg-amber-50 transition"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => setConfirmDelete(meeting.id)}
                    className="text-xs text-red-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            {/* 요일 + 시간 */}
            {(meeting.day_of_week || meeting.time) && (
              <p className="text-sm text-amber-700 mb-2 flex items-center gap-1.5">
                <span>📅</span>
                <span>
                  {meeting.day_of_week}
                  {meeting.day_of_week && meeting.time ? " " : ""}
                  {meeting.time}
                </span>
              </p>
            )}

            {/* 장소 */}
            {(meeting.location_name || meeting.address) && (
              <button
                onClick={() =>
                  openMap(meeting.address || meeting.location_name || "")
                }
                className="text-sm text-amber-700 mb-2 flex items-start gap-1.5 text-left hover:text-amber-900 transition"
              >
                <span className="shrink-0">📍</span>
                <span className="underline decoration-amber-300">
                  {meeting.location_name}
                  {meeting.location_name && meeting.address ? " · " : ""}
                  {meeting.address}
                </span>
              </button>
            )}

            {/* 연락처 */}
            {(meeting.contact_name || meeting.contact_phone) && (
              <div className="text-sm text-amber-700 mb-2 flex items-center gap-1.5">
                <span>📞</span>
                <span>{meeting.contact_name}</span>
                {meeting.contact_phone && (
                  <a
                    href={`tel:${meeting.contact_phone}`}
                    className="text-amber-600 underline decoration-amber-300 hover:text-amber-800"
                  >
                    {meeting.contact_phone}
                  </a>
                )}
              </div>
            )}

            {/* 설명 */}
            {meeting.description && (
              <p className="text-sm text-amber-600 mt-3 bg-amber-50 rounded-xl p-3 leading-relaxed">
                {meeting.description}
              </p>
            )}

            {/* 삭제 확인 */}
            {confirmDelete === meeting.id && (
              <div className="mt-3 p-3 bg-red-50 rounded-xl flex items-center justify-between">
                <p className="text-sm text-red-600">정말 삭제하시겠습니까?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(meeting.id)}
                    className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    삭제
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* 모임 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-amber-900">
                {editingId ? "모임 수정" : "모임 추가"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* 모임 이름 */}
              <div>
                <label className="text-sm font-medium text-amber-800 mb-1 block">
                  모임 이름 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="예: 희망 모임"
                  className="w-full px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
                />
              </div>

              {/* 요일 */}
              <div>
                <label className="text-sm font-medium text-amber-800 mb-1 block">
                  요일
                </label>
                <select
                  value={form.day_of_week}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, day_of_week: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
                >
                  <option value="">선택하세요</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* 시간 */}
              <div>
                <label className="text-sm font-medium text-amber-800 mb-1 block">
                  시간
                </label>
                <input
                  type="text"
                  value={form.time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time: e.target.value }))
                  }
                  placeholder="예: 오후 7:00"
                  className="w-full px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
                />
              </div>

              {/* 장소 이름 */}
              <div>
                <label className="text-sm font-medium text-amber-800 mb-1 block">
                  장소 이름
                </label>
                <input
                  type="text"
                  value={form.location_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location_name: e.target.value }))
                  }
                  placeholder="예: OO센터 3층"
                  className="w-full px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
                />
              </div>

              {/* 상세 주소 */}
              <div>
                <label className="text-sm font-medium text-amber-800 mb-1 block">
                  상세 주소
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  placeholder="예: 서울시 강남구 역삼동 123-45"
                  className="w-full px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
                />
              </div>

              {/* 대표봉사자 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-amber-800 mb-1 block">
                    대표봉사자
                  </label>
                  <input
                    type="text"
                    value={form.contact_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, contact_name: e.target.value }))
                    }
                    placeholder="이름"
                    className="w-full px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-amber-800 mb-1 block">
                    연락처
                  </label>
                  <input
                    type="tel"
                    value={form.contact_phone}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        contact_phone: e.target.value,
                      }))
                    }
                    placeholder="010-1234-5678"
                    className="w-full px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
                  />
                </div>
              </div>

              {/* 설명 */}
              <div>
                <label className="text-sm font-medium text-amber-800 mb-1 block">
                  모임 설명{" "}
                  <span className="text-amber-400 font-normal">(선택)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="모임에 대한 간단한 소개를 적어주세요"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-300 resize-none"
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {saving ? "저장 중..." : editingId ? "수정 완료" : "추가"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
