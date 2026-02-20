import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data: entry } = await supabase
    .from("gratitude_entries")
    .select("discovery, profiles:user_id(nickname)")
    .eq("id", params.id)
    .eq("is_public", true)
    .single();

  if (!entry) return { title: "감사일기" };

  const profile = entry.profiles as unknown as { nickname: string };

  return {
    title: `${profile?.nickname}님의 감사 - 감사일기`,
    description: entry.discovery,
    openGraph: {
      title: `${profile?.nickname}님의 감사`,
      description: entry.discovery,
    },
  };
}

export default async function SharePage({ params }: Props) {
  const supabase = createServerSupabaseClient();
  const { data: entry } = await supabase
    .from("gratitude_entries")
    .select("*, profiles:user_id(nickname, avatar_url)")
    .eq("id", params.id)
    .eq("is_public", true)
    .single();

  if (!entry) notFound();

  const profile = entry.profiles as unknown as {
    nickname: string;
    avatar_url: string | null;
  };

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-lg">
                  {profile?.nickname?.[0] || "?"}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-amber-900">
                {profile?.nickname || "익명"}
              </p>
              <p className="text-xs text-amber-500">
                {new Date(entry.created_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>

          {/* 감사 내용 */}
          <div className="bg-amber-50 rounded-xl p-4 mb-4">
            <p className="text-amber-900 text-lg font-medium">
              {entry.discovery}
            </p>
            {entry.reason && (
              <p className="text-amber-600 mt-2">{entry.reason}</p>
            )}
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-amber-600 text-sm mb-3">
              나도 감사일기를 시작해보세요
            </p>
            <a
              href="/signup"
              className="inline-block px-6 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition"
            >
              감사일기 시작하기
            </a>
          </div>
        </div>

        <p className="text-center text-amber-400 text-xs mt-4">
          🙏 감사일기
        </p>
      </div>
    </div>
  );
}
