"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithEmail, signInWithOAuth } from "@/lib/auth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/journal";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(
    error === "auth" ? "인증에 실패했습니다. 다시 시도해주세요." : ""
  );

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await signInWithEmail(email, password);
    if (error) {
      setErrorMsg(
        error.message === "Invalid login credentials"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : error.message
      );
      setLoading(false);
    } else {
      router.push(redirect);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await signInWithOAuth("google");
    if (error) {
      setErrorMsg("Google 로그인에 실패했습니다.");
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setLoading(true);
    const { error } = await signInWithOAuth("kakao");
    if (error) {
      setErrorMsg("카카오 로그인에 실패했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <div className="w-full max-w-sm">
        {/* 로고/타이틀 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🙏</div>
          <h1 className="text-2xl font-bold text-amber-900">감사일기</h1>
          <p className="text-amber-700 mt-1 text-sm">
            매일 감사를 기록하는 습관
          </p>
        </div>

        {/* 에러 메시지 */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* 이메일 로그인 폼 */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-400"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 구분선 */}
        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-amber-200" />
          <span className="px-3 text-xs text-amber-400">또는</span>
          <div className="flex-1 border-t border-amber-200" />
        </div>

        {/* 소셜 로그인 */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 계속하기
          </button>
          <button
            onClick={handleKakaoLogin}
            disabled={loading}
            className="w-full py-3 bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-medium rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#191919"
                d="M12 3C6.48 3 2 6.36 2 10.5c0 2.61 1.74 4.91 4.38 6.24l-1.12 4.1c-.08.3.26.54.52.37l4.89-3.22c.43.04.87.06 1.33.06 5.52 0 10-3.36 10-7.5S17.52 3 12 3z"
              />
            </svg>
            카카오로 계속하기
          </button>
        </div>

        {/* 회원가입 링크 */}
        <p className="text-center mt-6 text-sm text-amber-700">
          계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="text-amber-600 font-semibold hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
