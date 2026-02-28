"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase";
import { format, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import { getMaxGratitudeCount } from "@/utils/gratitude";

export default function SettingsPage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const supabase = createClient();

  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user || !nickname.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ nickname: nickname.trim(), bio: bio.trim() })
      .eq("id", user.id);

    if (error) {
      setMessage("저장에 실패했습니다.");
    } else {
      setMessage("프로필이 저장되었습니다.");
      await refreshProfile();
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleExportData = async () => {
    if (!user) return;

    const { data: entries } = await supabase
      .from("gratitude_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date");

    const { data: reflections } = await supabase
      .from("meditation_reflections")
      .select("*")
      .eq("user_id", user.id)
      .order("date");

    const exportData = {
      profile,
      gratitude_entries: entries,
      meditation_reflections: reflections,
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gratitude-journal-${format(new Date(), "yyyyMMdd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareData = {
      title: "감사일기",
      text: "매일 감사를 기록하고 함께 나누는 앱, 감사일기에 초대합니다!",
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        setShareMessage("링크가 복사되었습니다! 친구에게 공유해보세요 📋");
        setTimeout(() => setShareMessage(""), 3000);
      }
    } catch {
      // 사용자가 공유를 취소한 경우 무시
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (!user) return null;

  const joinedDays = profile
    ? differenceInDays(new Date(), new Date(profile.joined_at))
    : 0;
  const maxCount = profile ? getMaxGratitudeCount(profile.joined_at) : 3;

  return (
    <div className="space-y-4">
      {/* 프로필 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
        <h2 className="text-lg font-bold text-amber-900 mb-4">프로필</h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-amber-800 mb-1 block">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-amber-800 mb-1 block">
              자기소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="자유롭게 소개를 적어보세요"
              className="w-full px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-300 resize-none"
            />
          </div>

          {message && (
            <p className="text-sm text-green-600 text-center">{message}</p>
          )}

          <button
            onClick={handleSaveProfile}
            disabled={saving || !nickname.trim()}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition disabled:opacity-50"
          >
            {saving ? "저장 중..." : "프로필 저장"}
          </button>
        </div>
      </div>

      {/* 통계 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
        <h2 className="text-lg font-bold text-amber-900 mb-4">나의 기록</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{joinedDays}</p>
            <p className="text-xs text-amber-500 mt-1">함께한 일수</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{maxCount}</p>
            <p className="text-xs text-amber-500 mt-1">일일 감사 가능 수</p>
          </div>
        </div>
        {profile && (
          <p className="text-xs text-amber-500 text-center mt-3">
            가입일:{" "}
            {format(new Date(profile.joined_at), "yyyy년 M월 d일", {
              locale: ko,
            })}
          </p>
        )}
      </div>

      {/* 데이터 관리 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
        <h2 className="text-lg font-bold text-amber-900 mb-4">데이터 관리</h2>
        <button
          onClick={handleExportData}
          className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition mb-3"
        >
          데이터 내보내기 (JSON)
        </button>
      </div>

      {/* 앱 공유하기 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
        <h2 className="text-lg font-bold text-amber-900 mb-4">앱 공유하기</h2>
        <button
          onClick={handleShare}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          친구에게 감사일기 공유하기
        </button>
        {shareMessage && (
          <p className="text-sm text-green-600 text-center mt-3">
            {shareMessage}
          </p>
        )}
      </div>

      {/* 로그아웃 */}
      <button
        onClick={handleLogout}
        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl transition"
      >
        로그아웃
      </button>

      <div className="flex flex-col items-center gap-2 pb-4">
        <Image src="/logo.png" alt="감사일기" width={48} height={48} />
        <p className="text-xs text-amber-400">
          감사일기 v{process.env.NEXT_PUBLIC_APP_VERSION}
        </p>
      </div>
    </div>
  );
}
