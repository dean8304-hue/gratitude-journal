"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpWithEmail } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (nickname.trim().length < 2) {
      setErrorMsg("닉네임은 2자 이상 입력해주세요.");
      return;
    }

    setLoading(true);
    const { error } = await signUpWithEmail(email, password, nickname.trim());

    if (error) {
      if (error.message.includes("already registered")) {
        setErrorMsg("이미 등록된 이메일입니다.");
      } else {
        setErrorMsg(error.message);
      }
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-amber-900 mb-2">
            이메일을 확인해주세요
          </h2>
          <p className="text-amber-700 text-sm mb-6">
            <strong>{email}</strong>으로 인증 메일을 보냈습니다.
            <br />
            메일의 링크를 클릭하면 가입이 완료됩니다.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition"
          >
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-2xl font-bold text-amber-900">회원가입</h1>
          <p className="text-amber-700 mt-1 text-sm">
            감사일기를 시작해보세요
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="text"
            placeholder="닉네임 (2자 이상)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            minLength={2}
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-400"
          />
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
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-400"
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder:text-amber-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition disabled:opacity-50"
          >
            {loading ? "가입 중..." : "가입하기"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-amber-700">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="text-amber-600 font-semibold hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
