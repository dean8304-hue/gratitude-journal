"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMeditation } from "@/hooks/useMeditation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// 스켈레톤 UI
function MeditationSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 space-y-3">
        <div className="h-4 bg-amber-100 rounded w-1/3" />
        <div className="h-6 bg-amber-200 rounded w-2/3" />
        <div className="bg-amber-50 rounded-xl p-4 space-y-2">
          <div className="h-4 bg-amber-100 rounded w-full" />
          <div className="h-4 bg-amber-100 rounded w-5/6" />
          <div className="h-3 bg-amber-100 rounded w-1/4 mt-2" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-amber-100 rounded w-full" />
          <div className="h-4 bg-amber-100 rounded w-full" />
          <div className="h-4 bg-amber-100 rounded w-4/5" />
          <div className="h-4 bg-amber-100 rounded w-full" />
          <div className="h-4 bg-amber-100 rounded w-3/4" />
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 space-y-3">
        <div className="h-5 bg-amber-100 rounded w-1/4" />
        <div className="h-24 bg-amber-50 rounded-xl" />
        <div className="h-24 bg-amber-50 rounded-xl" />
        <div className="h-24 bg-amber-50 rounded-xl" />
      </div>
    </div>
  );
}

export default function MeditationPage() {
  const { user } = useAuth();
  const { meditation, savedReflection, loading, error, saveReflection } =
    useMeditation(user?.id);

  const [showKorean, setShowKorean] = useState(true);
  const [reflection, setReflection] = useState("");
  const [prayer, setPrayer] = useState("");
  const [memo, setMemo] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 저장된 기록 불러오기
  useEffect(() => {
    if (savedReflection) {
      setReflection(savedReflection.reflection ?? "");
      setPrayer(savedReflection.prayer ?? "");
      setMemo(savedReflection.memo ?? "");
    }
  }, [savedReflection]);

  const handleSave = async () => {
    setSaving(true);
    await saveReflection({ reflection, prayer, memo });
    setSaving(false);
    setEditing(false);
  };

  const today = format(new Date(), "yyyy년 M월 d일 EEEE", { locale: ko });

  // 표시할 텍스트 선택 (한국어 / 영문 토글)
  const title = showKorean
    ? meditation?.title_ko || meditation?.title_en
    : meditation?.title_en;
  const quote = showKorean
    ? meditation?.quote_ko || meditation?.quote_en
    : meditation?.quote_en;
  const source = showKorean
    ? meditation?.source_ko || meditation?.source_en
    : meditation?.source_en;
  const body = showKorean
    ? meditation?.body_ko || meditation?.body_en
    : meditation?.body_en;

  if (loading) return <MeditationSkeleton />;

  return (
    <div className="space-y-4">
      {/* JFT 명상 카드 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧘</span>
            <span className="text-xs text-amber-500 font-medium">
              Just For Today
            </span>
          </div>
          <span className="text-xs text-amber-400">{today}</span>
        </div>

        {error ? (
          /* 에러 상태 */
          <div className="mt-4 text-center py-6 space-y-3">
            <p className="text-amber-700 font-medium">
              오늘의 명상을 불러올 수 없습니다
            </p>
            <p className="text-amber-400 text-sm">
              인터넷 연결을 확인하거나 직접 방문해보세요.
            </p>
            <a
              href="https://www.jftna.org/jft/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 px-4 py-2 bg-amber-500 text-white text-sm rounded-xl hover:bg-amber-600 transition"
            >
              직접 방문하기 →
            </a>
          </div>
        ) : (
          <>
            {/* 제목 */}
            <h2 className="text-lg font-bold text-amber-900 mt-2 mb-4">
              {title}
            </h2>

            {/* 인용구 카드 */}
            {quote && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-amber-800 text-sm italic leading-relaxed">
                  {quote}
                </p>
                {source && (
                  <p className="text-amber-500 text-xs mt-2 text-right">
                    — {source}
                  </p>
                )}
              </div>
            )}

            {/* 본문 */}
            {body && (
              <div className="text-amber-800 text-sm leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto">
                {body}
              </div>
            )}

            {/* 언어 토글 */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowKorean((v) => !v)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-amber-200 text-xs text-amber-600 hover:bg-amber-50 transition"
              >
                <span>{showKorean ? "🇺🇸" : "🇰🇷"}</span>
                <span>{showKorean ? "원문 보기" : "번역 보기"}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 묵상 기록 영역 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-amber-800 font-semibold">나의 묵상 기록</h3>
          {savedReflection && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-amber-500 hover:text-amber-600"
            >
              수정하기
            </button>
          )}
        </div>

        {savedReflection && !editing ? (
          /* 저장된 기록 보기 */
          <div className="space-y-4">
            {savedReflection.reflection && (
              <div>
                <p className="text-xs font-medium text-amber-500 mb-1">
                  📖 오늘의 묵상
                </p>
                <p className="text-amber-800 text-sm leading-relaxed whitespace-pre-line bg-amber-50 rounded-xl p-3">
                  {savedReflection.reflection}
                </p>
              </div>
            )}
            {savedReflection.prayer && (
              <div>
                <p className="text-xs font-medium text-amber-500 mb-1">
                  🙏 특별 기도
                </p>
                <p className="text-amber-800 text-sm leading-relaxed whitespace-pre-line bg-amber-50 rounded-xl p-3">
                  {savedReflection.prayer}
                </p>
              </div>
            )}
            {savedReflection.memo && (
              <div>
                <p className="text-xs font-medium text-amber-500 mb-1">
                  📝 자유 메모
                </p>
                <p className="text-amber-800 text-sm leading-relaxed whitespace-pre-line bg-amber-50 rounded-xl p-3">
                  {savedReflection.memo}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* 작성 / 수정 폼 */
          <div className="space-y-4">
            {/* 오늘의 묵상 */}
            <div>
              <label className="text-xs font-medium text-amber-600 mb-1 block">
                📖 오늘의 묵상
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="명상을 읽고 느낀 점, 마음에 와닿은 문장을 자유롭게 적어보세요..."
                rows={4}
                className="w-full px-3 py-3 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-300 resize-none text-sm"
              />
            </div>

            {/* 특별 기도 */}
            <div>
              <label className="text-xs font-medium text-amber-600 mb-1 block">
                🙏 특별 기도{" "}
                <span className="text-amber-400 font-normal">(선택)</span>
              </label>
              <textarea
                value={prayer}
                onChange={(e) => setPrayer(e.target.value)}
                placeholder="오늘 특별히 기도하고 싶은 것이 있다면 적어보세요..."
                rows={3}
                className="w-full px-3 py-3 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-300 resize-none text-sm"
              />
            </div>

            {/* 자유 메모 */}
            <div>
              <label className="text-xs font-medium text-amber-600 mb-1 block">
                📝 자유 메모{" "}
                <span className="text-amber-400 font-normal">(선택)</span>
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="그 외 기억하고 싶은 것들을 자유롭게 메모해보세요..."
                rows={3}
                className="w-full px-3 py-3 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-300 resize-none text-sm"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={
                  saving ||
                  (!reflection.trim() && !prayer.trim() && !memo.trim())
                }
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm"
              >
                {saving ? "저장 중..." : savedReflection ? "수정 완료" : "저장"}
              </button>
              {editing && (
                <button
                  onClick={() => {
                    setEditing(false);
                    setReflection(savedReflection?.reflection ?? "");
                    setPrayer(savedReflection?.prayer ?? "");
                    setMemo(savedReflection?.memo ?? "");
                  }}
                  className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm"
                >
                  취소
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
