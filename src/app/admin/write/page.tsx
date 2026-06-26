"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, uploadDiaryImages } from "@/lib/diary";
import { supabaseClient } from "@/lib/supabaseClient";

export default function AdminWritePage() {
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    supabaseClient.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }
      setIsAuthenticated(Boolean(data.session?.user));
    });

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_, session) => {
      if (!isMounted) {
        return;
      }
      setIsAuthenticated(Boolean(session?.user));
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!imageFiles.length) {
      setImagePreviews([]);
      return;
    }

    const previews = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    return () => {
      previews.forEach(URL.revokeObjectURL);
    };
  }, [imageFiles]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setImageFiles(files);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isAuthenticated === false) {
      setErrorMessage("관리자 로그인이 필요합니다. 로그인 후 다시 시도하세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrls = imageFiles.length ? await uploadDiaryImages(imageFiles) : [];
      const result = await createPost({
        entryDate,
        content,
        youtubeUrl: youtubeUrl.trim() || null,
        imageUrls,
      });

      if (result.error) {
        setErrorMessage(result.error.message);
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage("일기가 성공적으로 저장되었습니다.");
      const [year, month, day] = entryDate.split("-");
      router.push(`https://my-diary-six-brown.vercel.app/diary/${Number(year)}/${Number(month)}/${Number(day)}`);
    } catch (error) {
      setErrorMessage("일기 저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setIsSubmitting(false);
    }
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#f7f4ef] px-4 py-10 text-[#1c1b18] sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-[#d8d0c1] bg-white p-8 shadow-[0_18px_80px_rgba(98,81,55,0.08)]">
          <h1 className="text-3xl font-semibold text-[#2f2314]">로그인이 필요합니다.</h1>
          <p className="mt-4 text-sm text-[#5f4b35]">관리자 계정으로 로그인한 뒤 /admin/login 페이지로 돌아가세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] px-4 py-10 text-[#1c1b18] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-[#d8d0c1] bg-white p-8 shadow-[0_18px_80px_rgba(98,81,55,0.08)]">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-[#7b541f]">새 일기 작성</h1>
          <p className="mt-2 text-sm text-[#5f4b35]">날짜, 본문, 이미지, 유튜브 링크를 추가하여 새 일기를 등록하세요.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#3d3428]">날짜</label>
            <input
              type="date"
              value={entryDate}
              onChange={(event) => setEntryDate(event.target.value)}
              className="w-full rounded-3xl border border-[#d8d0c1] bg-[#fbf7f0] px-4 py-3 text-sm text-[#2e2a24] outline-none transition focus:border-[#7b541f]"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#3d3428]">본문</label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
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
            <label className="mb-2 block text-sm font-semibold text-[#3d3428]">사진 업로드 (여러 장 선택 가능)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full rounded-3xl border border-[#d8d0c1] bg-[#fbf7f0] px-4 py-3 text-sm text-[#2e2a24] outline-none transition focus:border-[#7b541f]"
            />
          </div>

          {imagePreviews.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {imagePreviews.map((src, index) => (
                <img key={index} src={src} alt={`preview-${index}`} className="h-40 w-full rounded-3xl object-cover" />
              ))}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-3xl bg-[#fee3d0] p-4 text-sm text-[#7c3820]">{errorMessage}</div>
          ) : null}

          {successMessage ? (
            <div className="rounded-3xl bg-[#e6f2e8] p-4 text-sm text-[#2d5c34]">{successMessage}</div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full justify-center rounded-3xl bg-[#7b541f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6b492f] disabled:cursor-not-allowed disabled:bg-[#9c8b73]"
          >
            {isSubmitting ? "저장 중..." : "일기 저장"}
          </button>
        </form>
      </div>
    </div>
  );
}
