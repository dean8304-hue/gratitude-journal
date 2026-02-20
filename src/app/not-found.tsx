import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-amber-900 mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-amber-600 text-sm mb-6">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href="/journal"
          className="inline-block px-6 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
