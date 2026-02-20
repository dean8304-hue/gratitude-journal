"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

function clearAllStorage() {
  try { localStorage.clear(); } catch {}
  try { sessionStorage.clear(); } catch {}
  try {
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  } catch {}
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const mountedRef = useRef(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabaseRef.current
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (mountedRef.current) setProfile(data);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const handleSignOut = useCallback(async () => {
    try {
      await supabaseRef.current.auth.signOut();
    } catch {
      // signOut 실패해도 강제 클린업
    }
    if (mountedRef.current) {
      setUser(null);
      setProfile(null);
      setSession(null);
    }
    clearAllStorage();
    router.push("/login");
  }, [router]);

  // 1) 초기 세션 복원 + onAuthStateChange
  useEffect(() => {
    mountedRef.current = true;
    const supabase = supabaseRef.current;

    // 저장된 세션 복원 (새로고침 후에도 유지)
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mountedRef.current) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      }

      if (mountedRef.current) setLoading(false);
    };

    initSession();

    // 세션 변경 실시간 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        router.push("/login");
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, router]);

  // 2) 탭/앱 복귀 시 세션 재확인
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;

      const supabase = supabaseRef.current;
      const { data: { session } } = await supabase.auth.getSession();

      if (!mountedRef.current) return;

      if (!session) {
        // 세션 만료 → 로그인 페이지로
        setUser(null);
        setProfile(null);
        setSession(null);
        router.push("/login");
      } else {
        setSession(session);
        setUser(session.user);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, profile, session, loading, refreshProfile, signOut: handleSignOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
