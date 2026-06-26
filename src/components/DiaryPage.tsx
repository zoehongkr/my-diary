"use client";

import { useMemo, useState } from "react";
import { AdminActions } from "@/components/AdminActions";
import Comments from "@/components/Comments";

type PostDate = {
  year: number;
  month: number;
  day: number;
};

type DiaryEntry = {
  date: PostDate;
  headline: string;
  paragraphs: string[];
};

const entries: DiaryEntry[] = [
  {
    date: { year: 2016, month: 3, day: 7 },
    headline: "꽃샘추위와 봄의 온도차",
    paragraphs: [
      "오늘은 갑작스럽게 다시 쌀쌀해진 날씨 때문에 두꺼운 코트를 다시 꺼내 입었다.",
      "교차로를 지나가며 벚꽃봉오리를 보았고, 곧 있으면 온 동네가 핑크빛으로 물들 것 같다.",
      "저녁에는 따뜻한 차와 함께 노트에 짧은 일기를 남겼다. 감정은 사소한 순간에 더 진하게 남는다."
    ]
  },
  {
    date: { year: 2016, month: 3, day: 5 },
    headline: "작은 출근 풍경",
    paragraphs: [
      "오늘 출근길에는 회사 앞 카페에서 커피를 샀다. 직원은 새로운 블렌드에 대해 이야기했다.",
      "사무실 창가에 앉아 햇살을 받으며 하루를 계획했다. 가끔은 이렇게 평범한 하루가 가장 소중하게 느껴진다."
    ]
  }
];

const availableDates = [7, 5, 13, 15, 21, 22, 24, 30];
const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateLabel(date: PostDate) {
  return `${date.year}년 ${date.month}월 ${date.day}일`;
}

function getMonthDates(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeks: Array<Array<number | null>> = [];
  let week: Array<number | null> = Array(firstDay).fill(null);

  for (let date = 1; date <= daysInMonth; date += 1) {
    week.push(date);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  return weeks;
}

export function DiaryPage({
  initialDate,
  serverPost,
  monthPostDays,
  initialComments,
}: {
  initialDate?: PostDate;
  serverPost?: {
    id: string;
    entryDate: string;
    content: string;
    youtubeUrl: string | null;
    images: Array<{ id: string; imageUrl: string; sortOrder: number }>;
  } | null;
  monthPostDays?: number[];
  initialComments?: Array<{ id: string; nickname: string; content: string; created_at: string }>;
}) {
  const [selectedDate, setSelectedDate] = useState<PostDate>(initialDate ?? { year: 2016, month: 3, day: 7 });
  const [showYearMenu, setShowYearMenu] = useState(false);
  const [showMonthMenu, setShowMonthMenu] = useState(false);

  const selectedEntry = useMemo(() => {
    if (serverPost) return null;
    return entries.find(
      (entry) =>
        entry.date.year === selectedDate.year &&
        entry.date.month === selectedDate.month &&
        entry.date.day === selectedDate.day
    );
  }, [selectedDate, serverPost]);

  const yearOptions = [2015, 2016, 2017];
  const monthOptions = Array.from({ length: 12 }, (_, idx) => idx + 1);
  const calendarRows = getMonthDates(selectedDate.year, selectedDate.month);
  const monthDateSet = new Set(monthPostDays ?? availableDates);

  return (
    <div className="min-h-screen bg-[#f7f4ef] px-4 py-8 text-[#1c1b18] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-[#d8d0c1] bg-white p-5 shadow-[0_18px_80px_rgba(98,81,55,0.08)] sm:p-8">
        <header className="flex flex-col gap-5 border-b border-[#e7e0d2] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#1f1a17] text-sm font-bold uppercase tracking-[0.22em] text-[#f8e6c8]">
              ICON
            </div>
            <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#2e2a24] sm:gap-5">
              <span>언니네이발관</span>
              <span className="text-[#bfa27b]">|</span>
              <span>새소식</span>
              <span className="text-[#bfa27b]">|</span>
              <span>특집</span>
              <span className="text-[#bfa27b]">|</span>
              <span>게시판</span>
              <span className="text-[#bfa27b]">|</span>
              <span>섭외창구</span>
            </nav>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <AdminActions />
            <a
              href="#"
              className="inline-flex items-center rounded-full bg-[#f8ecd5] px-4 py-2 text-sm font-semibold text-[#5f4b35] shadow-sm shadow-[#d6c2a3]/50"
            >
              ◀ 처음으로
            </a>
          </div>
        </header>

        <main className="mt-8 grid gap-8 lg:grid-cols-[0.65fr_0.35fr] lg:gap-10">
          <section className="space-y-6 border border-[#e7e0d2] bg-[#fbf7f0] p-8 text-[#221f1a] shadow-[0_18px_50px_rgba(101,76,34,0.08)]">
            <div className="space-y-4">
              <h1 className="text-[min(3.4rem,6vw)] font-serif text-[#7b541f] leading-tight">
                일기
              </h1>
              <div className="h-px w-full bg-[#d8d0c1]" />
            </div>

            <article>
              <div className="mb-5">
                <p className="text-sm font-semibold text-[#5f4b35]">{formatDateLabel(selectedDate)}</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#2f2314]">
                  {selectedEntry ? selectedEntry.headline : "이 날의 일기 없음"}
                </h2>
              </div>

              <div className="space-y-5 text-sm leading-8 text-[#40382f]">
                  {serverPost ? (
                    <>
                      {serverPost.youtubeUrl ? (
                        <div className="mb-5 aspect-video overflow-hidden rounded-3xl bg-black">
                          <iframe
                            className="h-full w-full"
                            src={(() => {
                              const m = serverPost.youtubeUrl?.match(/(?:youtu\.be\/(.+)|youtube\.com\/(?:watch\?v=|embed\/)([^&\n?#]+))/);
                              const vid = m ? m[1] || m[2] : null;
                              return vid ? `https://www.youtube.com/embed/${vid}` : "";
                            })()}
                            title="YouTube video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : null}

                      {serverPost.images.length > 0 ? (
                        <div className="mb-6 grid gap-4 sm:grid-cols-2">
                          {serverPost.images
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((image) => (
                              <img key={image.id} src={image.imageUrl} alt="Diary image" className="h-64 w-full rounded-3xl object-cover" />
                            ))}
                        </div>
                      ) : null}

                      <div className="space-y-5 text-sm leading-8 text-[#40382f]">
                        {serverPost.content.split("\n").map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                      <Comments postId={serverPost.id} initial={initialComments ?? []} />
                    </>
                  ) : selectedEntry ? (
                    selectedEntry.paragraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))
                  ) : (
                    <p>선택한 날짜에 해당하는 일기가 없습니다. 캘린더에서 다른 날짜를 선택해 보세요.</p>
                  )}
              </div>
            </article>
          </section>

          <aside className="rounded-[32px] border border-[#e7e0d2] bg-[#fcfaf6] p-6 shadow-[0_18px_50px_rgba(101,76,34,0.08)]">
            <div className="text-center text-sm font-semibold text-[#5f4b35]">
              {selectedDate.year}년&nbsp;{selectedDate.month}월
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#5f4b35]">
              {daysOfWeek.map((day, index) => (
                <div key={day} className={index === 0 ? "text-[#be5b8a]" : index === 6 ? "text-[#3b5fbc]" : "text-[#2e2a24]"}>
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2">
              {calendarRows.map((week, index) => (
                <div key={index} className="grid grid-cols-7 gap-2">
                  {week.map((date, idx) => {
                    if (date === null) {
                      return <div key={idx} className="h-10 rounded-2xl bg-transparent" />;
                    }

                    const hasPost = availableDates.includes(date);
                    const isSelected = date === selectedDate.day;
                    const isSunday = idx === 0;
                    const isSaturday = idx === 6;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedDate({ ...selectedDate, day: date })}
                        disabled={!hasPost}
                        className={`h-10 rounded-2xl text-sm font-semibold transition ${
                          isSelected
                            ? "bg-[#7b541f] text-white"
                            : hasPost
                            ? "bg-[#fff6eb] text-[#423627] hover:bg-[#f1e3cb]"
                            : "bg-transparent text-[#b8b0a4]"
                        } ${isSunday ? "text-[#be5b8a]" : isSaturday ? "text-[#3b5fbc]" : ""}`}
                      >
                        {date}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between text-sm font-semibold text-[#5f4b35]">
              <button type="button" onClick={() => setSelectedDate((prev) => ({ ...prev, month: Math.max(1, prev.month - 1) }))}>
                이전달 &lt;&lt;
              </button>
              <button type="button" onClick={() => setSelectedDate((prev) => ({ ...prev, month: Math.min(12, prev.month + 1) }))}>
                &gt;&gt; 다음달
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm text-[#3d3428]">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowYearMenu((current) => !current)}
                  className="w-full rounded-2xl border border-[#d8d0c1] bg-white px-4 py-3 text-left shadow-sm"
                >
                  {selectedDate.year}년 ⌄
                </button>
                {showYearMenu && (
                  <div className="absolute left-0 top-full z-10 mt-2 w-full rounded-2xl border border-[#d8d0c1] bg-white shadow-xl">
                    {yearOptions.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          setSelectedDate((prev) => ({ ...prev, year }));
                          setShowYearMenu(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm ${
                          year === selectedDate.year ? "bg-[#e8d7b4] text-[#1f1a17]" : "text-[#4a4135]"
                        }`}
                      >
                        <span>{year}년</span>
                        {year === selectedDate.year ? <span>✓</span> : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMonthMenu((current) => !current)}
                  className="w-full rounded-2xl border border-[#d8d0c1] bg-white px-4 py-3 text-left shadow-sm"
                >
                  {selectedDate.month}월 ⌄
                </button>
                {showMonthMenu && (
                  <div className="absolute left-0 top-full z-10 mt-2 w-full rounded-2xl border border-[#d8d0c1] bg-white shadow-xl">
                    {monthOptions.map((month) => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => {
                          setSelectedDate((prev) => ({ ...prev, month }));
                          setShowMonthMenu(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm ${
                          month === selectedDate.month ? "bg-[#e8d7b4] text-[#1f1a17]" : "text-[#4a4135]"
                        }`}
                      >
                        <span>{month}월</span>
                        {month === selectedDate.month ? <span>✓</span> : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
