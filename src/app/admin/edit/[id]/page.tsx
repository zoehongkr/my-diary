"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { getPostById, uploadDiaryImages, updatePost, deletePost } from "@/lib/diary";

export default function AdminEditPage() {
  const params = useParams();
  const rawId = params?.id ?? null;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [entryDate, setEntryDate] = useState("");
  const [content, setContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!id) return;

    getPostById(id).then((post) => {
      if (!mounted) return;
      if (!post) {
        setError("게시물을 불러올 수 없습니다.");
        setLoading(false);
        return;
      }

      setEntryDate(post.entryDate);
      setContent(post.content);
      setYoutubeUrl(post.youtubeUrl ?? "");
      setExistingImages(post.images.map((i) => i.imageUrl));
      setLoading(false);
    });

    supabaseClient.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsAuthenticated(Boolean(data.session?.user));
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_, session) => {
      if (!mounted) return;
      setIsAuthenticated(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [id]);

  useEffect(() => {
    if (!newFiles.length) {
      setNewPreviews([]);
      return;
    }

    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setNewPreviews(previews);
    return () => previews.forEach(URL.revokeObjectURL);
  }, [newFiles]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewFiles(files);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (isAuthenticated === false) return setError("관리자 로그인이 필요합니다.");
    if (!id) return setError("유효하지 않은 게시물입니다.");
    setIsSubmitting(true);

    try {
      const uploaded = newFiles.length ? await uploadDiaryImages(newFiles) : undefined;
      const imageUrls = uploaded === undefined ? undefined : uploaded;

      const res = await updatePost(id, {
        entryDate,
        content,
        youtubeUrl: youtubeUrl.trim() || null,
        imageUrls: imageUrls ?? undefined,
      });

      if (res.error) {
        setError(res.error.message ?? "수정 중 오류가 발생했습니다.");
        setIsSubmitting(false);
        return;
      }

      router.push(`https://my-diary-six-brown.vercel.app/diary/${new Date(entryDate).getUTCFullYear()}/${new Date(entryDate).getUTCMonth()+1}/${new Date(entryDate).getUTCDate()}`);
    } catch (err) {
      setError("수정 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm("정말로 이 일기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    const res = await deletePost(id);
    if (res.error) {
      setError(res.error.message ?? "삭제 중 오류가 발생했습니다.");
      return;
    }

    router.push("/diary");
    router.refresh();
  }

  if (loading) {
    return <div className="p-8">로딩 중...</div>;
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#f7f4ef] px-4 py-10 text-[#1c1b18] sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-[#d8d0c1] bg-white p-8 shadow-[0_18px_80px_rgba(98,81,55,0.08)]">
          <h1 className="text-3xl font-semibold text-[#2f2314]">로그인이 필요합니다.</h1>
          <p className="mt-4 text-sm text-[#5f4b35]">관리자 계정으로 로그인한 뒤 이 페이지에 다시 접속하세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] px-4 py-10 text-[#1c1b18] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-[#d8d0c1] bg-white p-8 shadow-[0_18px_80px_rgba(98,81,55,0.08)]">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-[#7b541f]">일기 수정</h1>
          <p className="mt-2 text-sm text-[#5f4b35]">내용을 수정하고 저장하세요.</p>
        </div>

        {error ? <div className="rounded-3xl bg-[#fee3d0] p-4 text-sm text-[#7c3820]">{error}</div> : null}

        <form className="space-y-6" onSubmit={handleUpdate}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#3d3428]">날짜</label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full rounded-3xl border border-[#d8d0c1] bg-[#fbf7f0] px-4 py-3 text-sm text-[#2e2a24] outline-none transition focus:border-[#7b541f]"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#3d3428]">본문</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-56 w-full rounded-3xl border border-[#d8d0c1] bg-[#fbf7f0] px-4 py-4 text-sm text-[#2e2a24] outline-none transition focus:border-[#7b541f]"
              placeholder="여기에 일기 내용을 입력하세요."
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#3d3428]">유튜브 링크 (선택)</label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              className="w-full rounded-3xl border border-[#d8d0c1] bg-[#fbf7f0] px-4 py-3 text-sm text-[#2e2a24] outline-none transition focus:border-[#7b541f]"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#3d3428]">현재 이미지</label>
            <div className="grid gap-4 sm:grid-cols-2">
              {existingImages.map((src, idx) => (
                <img key={idx} src={src} alt={`existing-${idx}`} className="h-40 w-full rounded-3xl object-cover" />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#3d3428]">새 이미지 업로드 (선택)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full rounded-3xl border border-[#d8d0c1] bg-[#fbf7f0] px-4 py-3 text-sm text-[#2e2a24] outline-none transition focus:border-[#7b541f]"
            />
          </div>

          {newPreviews.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {newPreviews.map((src, index) => (
                <img key={index} src={src} alt={`preview-${index}`} className="h-40 w-full rounded-3xl object-cover" />
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-3xl bg-[#7b541f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6b492f] disabled:cursor-not-allowed disabled:bg-[#9c8b73]"
            >
              {isSubmitting ? "저장 중..." : "수정 저장"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex justify-center rounded-3xl border border-[#e5b4a8] bg-[#fff1f0] px-6 py-3 text-sm font-semibold text-[#a83a2f] hover:bg-[#ffe8e5]"
            >
              글 삭제
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
