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
            className="rounded-full bg-[#7b541f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6b492f]"
          >
            글쓰기
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-[#d8d0c1] bg-white px-4 py-2 text-sm font-semibold text-[#3d3428] transition hover:bg-[#fbf7f0]"
          >
            로그아웃
          </button>
        </>
      ) : (
        <Link
          href="/admin/login"
          className="rounded-full border border-[#d8d0c1] bg-white px-4 py-2 text-sm font-semibold text-[#3d3428] transition hover:bg-[#fbf7f0]"
        >
          관리자 로그인
        </Link>
      )}
    </div>
  );
}
