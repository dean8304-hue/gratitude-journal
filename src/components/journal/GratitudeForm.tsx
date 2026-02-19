"use client";

import { useState } from "react";

interface GratitudeFormProps {
  onSubmit: (discovery: string, reason: string) => Promise<void>;
  disabled?: boolean;
}

export default function GratitudeForm({
  onSubmit,
  disabled,
}: GratitudeFormProps) {
  const [discovery, setDiscovery] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReason, setShowReason] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discovery.trim() || submitting) return;

    setSubmitting(true);
    await onSubmit(discovery.trim(), reason.trim());
    setDiscovery("");
    setReason("");
    setShowReason(false);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-amber-800 mb-1 block">
            오늘 발견한 감사한 것
          </label>
          <textarea
            value={discovery}
            onChange={(e) => setDiscovery(e.target.value)}
            placeholder="무엇에 감사한가요?"
            rows={2}
            disabled={disabled}
            className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-300 resize-none disabled:opacity-50"
          />
        </div>

        {showReason ? (
          <div>
            <label className="text-sm font-medium text-amber-800 mb-1 block">
              왜 감사한가요? (선택)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="이유를 적어보세요..."
              rows={2}
              disabled={disabled}
              className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-300 resize-none disabled:opacity-50"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowReason(true)}
            className="text-sm text-amber-500 hover:text-amber-600"
          >
            + 이유 추가하기
          </button>
        )}

        <button
          type="submit"
          disabled={!discovery.trim() || submitting || disabled}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "저장 중..." : "감사 추가하기"}
        </button>
      </div>
    </form>
  );
}
