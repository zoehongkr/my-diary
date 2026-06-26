"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

type Comment = {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
};

export default function Comments({ postId, initial = [] }: { postId?: string | null; initial?: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initial);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!postId) return;

    // initial load if no initial provided
    if (initial.length === 0) {
      supabaseClient
        .from("comments")
        .select("id, nickname, content, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: true })
        .then(({ data }) => {
          if (!mounted) return;
          setComments(data ?? []);
        });
    }

    supabaseClient.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsAdmin(Boolean(data.session?.user));
    });

    return () => {
      mounted = false;
    };
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!postId) return setError("게시물이 지정되지 않았습니다.");
    if (!content.trim()) return setError("댓글 내용을 입력하세요.");

    setIsSubmitting(true);

    const payload = {
      post_id: postId,
      nickname: nickname.trim() || "익명",
      delete_password: password.trim() ? await hashString(password.trim()) : null,
      content: content.trim(),
    };

    const { data, error: insertError } = await supabaseClient.from("comments").insert([payload]).select("id, nickname, content, created_at");

    setIsSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data && data[0]) {
      setComments((prev) => [...prev, data[0]]);
      setNickname("");
      setPassword("");
      setContent("");
    }
  }

  async function handleDelete(commentId: string) {
    setError(null);
    if (!postId) return setError("게시물이 지정되지 않았습니다.");

    if (isAdmin) {
      const { error: delErr } = await supabaseClient.from("comments").delete().eq("id", commentId);
      if (delErr) return setError(delErr.message);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      return;
    }

    const pw = prompt("삭제할 댓글의 비밀번호 4자리를 입력하세요");
    if (!pw) return;

    const hashed = await hashString(pw);

    const { data, error: delError } = await supabaseClient
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("delete_password", hashed)
      .select("id");

    if (delError) {
      setError(delError.message);
      return;
    }

    // If deletion returned rows, update UI
    if (data && data.length > 0) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } else {
      setError("비밀번호가 일치하지 않거나 삭제할 수 없습니다.");
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-[#e7e0d2] bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-[#2f2314]">댓글</h3>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-[#6b5b4a]">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-4 rounded-2xl border border-[#f1ede6] bg-[#fbf7f0] p-3">
              <div>
                <div className="text-sm font-semibold text-[#3d3428]">{c.nickname}</div>
                <div className="mt-1 text-sm text-[#423627]">{c.content}</div>
                <div className="mt-2 text-xs text-[#7b6a54]">{new Date(c.created_at).toLocaleString()}</div>
              </div>
              <div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="rounded-full border border-[#d8d0c1] bg-white px-3 py-1 text-xs font-semibold text-[#3d3428]"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        {error ? <div className="rounded-2xl bg-[#fee3d0] p-3 text-sm text-[#7c3820]">{error}</div> : null}

        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (선택)"
            className="col-span-2 rounded-2xl border border-[#d8d0c1] bg-[#fbf7f0] px-3 py-2 text-sm text-[#2e2a24]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (선택)"
            className="rounded-2xl border border-[#d8d0c1] bg-[#fbf7f0] px-3 py-2 text-sm text-[#2e2a24]"
          />
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글 내용을 입력하세요"
          className="w-full rounded-2xl border border-[#d8d0c1] bg-[#fbf7f0] px-3 py-3 text-sm text-[#2e2a24]"
          rows={4}
        />

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-[#7b541f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
}

async function hashString(input: string) {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    // Fallback naive hash (not ideal) for environments without Web Crypto
    let h = 0;
    for (let i = 0; i < input.length; i++) {
      h = (h << 5) - h + input.charCodeAt(i);
      h |= 0;
    }
    return String(h);
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
