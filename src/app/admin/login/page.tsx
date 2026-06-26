"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPassword } from "@/lib/auth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const { error } = await signInWithPassword(email, password);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/admin/write");
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] px-4 py-10 text-[#1c1b18] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-[#d8d0c1] bg-white p-8 shadow-[0_18px_80px_rgba(98,81,55,0.08)]">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-serif text-[#7b541f]">관리자 로그인</h1>
          <p className="mt-2 text-sm text-[#5f4b35]">Supabase 관리자 계정으로 로그인해야 글을 작성할 수 있습니다.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#3d3428]">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-3xl border border-[#d8d0c1] bg-[#fbf7f0] px-4 py-3 text-sm text-[#2e2a24] outline-none transition focus:border-[#7b541f]"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#3d3428]">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-3xl border border-[#d8d0c1] bg-[#fbf7f0] px-4 py-3 text-sm text-[#2e2a24] outline-none transition focus:border-[#7b541f]"
              placeholder="••••••••"
              required
            />
          </div>

          {errorMessage ? (
            <div className="rounded-3xl bg-[#fee3d0] p-4 text-sm text-[#7c3820]">{errorMessage}</div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full justify-center rounded-3xl bg-[#7b541f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6b492f] disabled:cursor-not-allowed disabled:bg-[#9c8b73]"
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
