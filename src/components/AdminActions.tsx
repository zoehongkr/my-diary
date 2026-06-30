"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export function AdminActions() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    supabaseClient.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setIsAuthenticated(Boolean(data.session?.user));
      }
    });

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_, session) => {
      if (isMounted) {
        setIsAuthenticated(Boolean(session?.user));
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await supabaseClient.auth.signOut();
    setIsAuthenticated(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {isAuthenticated ? (
        <>
          <Link
            href="/admin/write"
            className="rounded-sm border border-[#111] bg-[#111] px-3 py-1.5 text-sm font-semibold text-white"
          >
            글쓰기
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-sm border border-[#111] bg-white px-3 py-1.5 text-sm font-semibold text-[#111]"
          >
            로그아웃
          </button>
        </>
      ) : (
        <Link
          href="/admin/login"
          className="rounded-sm border border-[#111] bg-white px-3 py-1.5 text-sm font-semibold text-[#111]"
        >
          관리자 로그인
        </Link>
      )}
    </div>
  );
}
