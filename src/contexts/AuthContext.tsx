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
    console.log("[DEBUG] AuthContext: signOut called");
    try {
      await supabaseRef.current.auth.signOut();
      console.log("[DEBUG] AuthContext: signOut success");
    } catch (e) {
      console.log("[DEBUG] AuthContext: signOut failed, forcing cleanup", e);
    }
    if (mountedRef.current) {
      setUser(null);
      setProfile(null);
      setSession(null);
    }
    clearAllStorage();
    window.location.href = "/login";
  }, []);

  // 1) 세션 초기화: getSession + onAuthStateChange 이중 안전장치
  useEffect(() => {
    mountedRef.current = true;
    const supabase = supabaseRef.current;
    let loadingResolved = false;

    const resolveLoading = () => {
      if (!loadingResolved && mountedRef.current) {
        loadingResolved = true;
        console.log("[DEBUG] AuthContext: setLoading(false)");
        setLoading(false);
      }
    };

    // 방법1: getSession으로 즉시 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[DEBUG] AuthContext: getSession result -", {
        hasSession: !!session,
        userEmail: session?.user?.email,
      });
      if (!mountedRef.current) return;

      setSession(session);
      setUser(session?.user ?? null);

      // 프로필은 백그라운드에서 로딩 (loading 해제를 블로킹하지 않음)
      if (session?.user) {
        fetchProfile(session.user.id).catch(() => {});
      }

      resolveLoading();
    }).catch(() => {
      resolveLoading();
    });

    // 방법2: onAuthStateChange로 이후 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[DEBUG] AuthContext: onAuthStateChange -", event, {
        hasSession: !!session,
        userEmail: session?.user?.email,
      });
      if (!mountedRef.current) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (event === "INITIAL_SESSION") {
        // getSession에서 이미 처리, loading만 확실히 해제
        if (session?.user) {
          fetchProfile(session.user.id).catch(() => {});
        }
        resolveLoading();
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          fetchProfile(session.user.id).catch(() => {});
        }
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
      }

      resolveLoading();
    });

    // 방법3: 안전장치 - 5초 후에도 loading이면 강제 해제
    const safetyTimeout = setTimeout(() => {
      console.log("[DEBUG] AuthContext: safety timeout - forcing loading false");
      resolveLoading();
    }, 5000);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [fetchProfile]);

  // 2) 탭/앱 복귀 시 세션 재확인
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;

      console.log("[DEBUG] AuthContext: tab became visible, checking session");
      const supabase = supabaseRef.current;
      const { data: { session } } = await supabase.auth.getSession();

      if (!mountedRef.current) return;

      if (!session) {
        console.log("[DEBUG] AuthContext: no session on tab return, redirecting");
        setUser(null);
        setProfile(null);
        setSession(null);
        window.location.href = "/login";
        return;
      } else {
        console.log("[DEBUG] AuthContext: session valid on tab return, user:", session.user.email);
        setSession(session);
        setUser(session.user);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, session, loading, refreshProfile, signOut: handleSignOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
