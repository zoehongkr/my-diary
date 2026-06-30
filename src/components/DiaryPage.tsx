"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminActions } from "@/components/AdminActions";
import Comments from "@/components/Comments";
import { getPostDatesByMonth } from "@/lib/diary";
import { supabaseClient } from "@/lib/supabaseClient";

type PostDate = {
  year: number;
  month: number;
  day: number;
};

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateLabel(date: PostDate) {
  return `${date.year}년 ${date.month}월 ${date.day}일`;
}

function formatCreatedAt(value: string) {
  const date = new Date(value);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
  serverPosts,
  monthPostDays,
}: {
  initialDate?: PostDate;
  serverPosts?: Array<{
    id: string;
    entryDate: string;
    content: string;
    title?: string | null;
    youtubeUrl: string | null;
    images: Array<{ id: string; imageUrl: string; sortOrder: number }>;
    createdAt: string;
  }>;
  monthPostDays?: number[];
}) {
  const router = useRouter();
  const initialDateValue: PostDate =
    initialDate ?? {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
    };

  const [selectedDate, setSelectedDate] = useState<PostDate>(initialDateValue);
  const [calendarDate, setCalendarDate] = useState<PostDate>(initialDateValue);
  const [monthPostDaysState, setMonthPostDaysState] = useState<number[] | undefined>(monthPostDays);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const yearOptions = Array.from({ length: 21 }, (_, idx) => 2016 + idx);
  const monthOptions = Array.from({ length: 12 }, (_, idx) => idx + 1);
  const calendarRows = getMonthDates(calendarDate.year, calendarDate.month);
  const monthDateSet = useMemo(() => new Set(monthPostDaysState ?? []), [monthPostDaysState]);
  const formattedDiaryHeading = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
      setCalendarDate(initialDate);
    }
  }, [initialDate]);

  useEffect(() => {
    let isMounted = true;
    supabaseClient.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setIsAuthenticated(Boolean(data.session?.user));
    });

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_, session) => {
      if (!isMounted) return;
      setIsAuthenticated(Boolean(session?.user));
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function loadMonthDays() {
      const monthDays = await getPostDatesByMonth(calendarDate.year, calendarDate.month);
      setMonthPostDaysState(monthDays);
    }

    loadMonthDays();
  }, [calendarDate.year, calendarDate.month]);

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-[#111] sm:px-6 lg:px-16">
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-5 sm:p-8">
        <header className="flex flex-col gap-5 pb-5 sm:flex-row sm:items-center sm:justify-between">
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
              className="inline-flex items-center rounded-sm border border-[#111] bg-white px-3 py-1.5 text-sm font-semibold text-[#111]"
            >
              ◀ 처음으로
            </a>
          </div>
        </header>

        <main className="mt-8 grid gap-8 lg:grid-cols-[0.72fr_0.28fr] lg:gap-10">
          <section className="space-y-6 bg-white p-8 text-[#111]">
            <article>
              <div className="mb-6">
                <h2 className="text-[1.75rem] font-serif font-semibold text-[#111] tracking-[-0.01em]">
                  {formattedDiaryHeading}
                </h2>
              </div>

              <div className="space-y-5 text-sm leading-8 text-[#40382f]">
                {serverPosts && serverPosts.length > 0 ? (
                  <div className="space-y-10">
                    {serverPosts.map((post) => (
                      <article key={post.id} className="border-t border-[#d3d0cc] bg-transparent px-0 pt-8">
                        <div className="mb-3">
                          <h3 className="text-[1.05rem] font-serif font-semibold text-[#111]">{post.title || "일기"}</h3>
                        </div>
                        {post.youtubeUrl ? (
                          <div className="mb-5 aspect-video overflow-hidden rounded-2xl bg-black">
                            <iframe
                              className="h-full w-full"
                              src={(() => {
                                const m = post.youtubeUrl?.match(/(?:youtu\.be\/(.+)|youtube\.com\/(?:watch\?v=|embed\/)([^&\n?#]+))/);
                                const vid = m ? m[1] || m[2] : null;
                                return vid ? `https://www.youtube.com/embed/${vid}` : "";
                              })()}
                              title="YouTube video"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : null}

                        {post.images.length > 0 ? (
                          <div className="mb-6 grid gap-4 sm:grid-cols-2">
                            {post.images
                              .sort((a, b) => a.sortOrder - b.sortOrder)
                              .map((image) => (
                                <img key={image.id} src={image.imageUrl} alt="Diary image" className="h-64 w-full rounded-2xl object-cover" />
                              ))}
                          </div>
                        ) : null}

                        <div className="space-y-5 text-sm leading-8 text-[#40382f] max-w-prose">
                          {post.content.split("\n").map((line, index) => (
                            <p key={index}>{line}</p>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-3 text-[#7b6a54]">
                          <span className="text-[12px] leading-tight text-[#7b6a54]">
                            작성: {formatCreatedAt(post.createdAt)}
                          </span>
                          {isAuthenticated ? (
                            <a
                              href={`/admin/edit/${post.id}`}
                              className="rounded-[2px] border border-[#111] bg-white px-2 py-1 text-[12px] font-semibold leading-tight text-[#111]"
                            >
                              수정
                            </a>
                          ) : null}
                        </div>

                        <Comments postId={post.id} />
                      </article>
                    ))}
                  </div>
                ) : (
                  <p>선택한 날짜에 해당하는 일기가 없습니다. 캘린더에서 다른 날짜를 선택해 보세요.</p>
                )}
              </div>
            </article>
          </section>

          <aside className="bg-white pt-8 pb-5 px-5 text-[#1f1b18]">
            <div className="text-center text-sm font-semibold text-[#5f4b35]">
              {calendarDate.year}년&nbsp;{calendarDate.month}월
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#5f4b35]">
              {daysOfWeek.map((day, index) => (
                <div key={day} className={index === 0 ? "text-[#be5b8a]" : index === 6 ? "text-[#3b5fbc]" : "text-[#5f4b35]"}>
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-1">
              {calendarRows.map((week, index) => (
                <div key={index} className="grid grid-cols-7 gap-2">
                  {week.map((date, idx) => {
                    if (date === null) {
                      return <div key={idx} className="h-9 bg-transparent" />;
                    }

                    const hasPost = monthDateSet.has(date);
                    const isSelected = date === selectedDate.day && calendarDate.year === selectedDate.year && calendarDate.month === selectedDate.month;
                    const isSunday = idx === 0;
                    const isSaturday = idx === 6;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!hasPost) return;
                          router.push(`/diary/${calendarDate.year}/${calendarDate.month}/${date}`);
                        }}
                        disabled={!hasPost}
                        className={`h-9 min-h-[2.25rem] rounded-sm px-0 text-sm transition ${
                          isSelected
                            ? "font-semibold text-[#111]"
                            : hasPost
                            ? "font-medium text-[#111]"
                            : "text-[#b5b1aa]"
                        } ${!hasPost ? "pointer-events-none cursor-default" : "cursor-pointer hover:text-[#000]"}`}
                      >
                        {date}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between text-sm text-[#7a7a7a]">
              <button
                type="button"
                onClick={() =>
                  setCalendarDate((prev) => {
                    const prevMonth = prev.month - 1;
                    const year = prevMonth < 1 ? prev.year - 1 : prev.year;
                    const month = prevMonth < 1 ? 12 : prevMonth;
                    return {
                      year,
                      month,
                      day: Math.min(prev.day, new Date(year, month, 0).getDate()),
                    };
                  })
                }
                className="hover:text-[#1f1b18]"
              >
                이전달
              </button>
              <button
                type="button"
                onClick={() =>
                  setCalendarDate((prev) => {
                    const nextMonth = prev.month + 1;
                    const year = nextMonth > 12 ? prev.year + 1 : prev.year;
                    const month = nextMonth > 12 ? 1 : nextMonth;
                    return {
                      year,
                      month,
                      day: Math.min(prev.day, new Date(year, month, 0).getDate()),
                    };
                  })
                }
                className="hover:text-[#1f1b18]"
              >
                다음달
              </button>
            </div>

            <div className="mt-5 text-sm text-[#3d3428]">
              <div className="flex justify-center items-center gap-[10px]">
                <div className="relative inline-flex">
                  <select
                    value={calendarDate.year}
                    onChange={(e) => setCalendarDate((prev) => ({ ...prev, year: Number(e.target.value) }))}
                    className="calendar-native-select calendar-native-select-year"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    ))}
                  </select>
                  <span className="calendar-native-select-arrow">▾</span>
                </div>
                <div className="relative inline-flex">
                  <select
                    value={calendarDate.month}
                    onChange={(e) => setCalendarDate((prev) => ({ ...prev, month: Number(e.target.value) }))}
                    className="calendar-native-select calendar-native-select-month"
                  >
                    {monthOptions.map((month) => (
                      <option key={month} value={month}>
                        {month}월
                      </option>
                    ))}
                  </select>
                  <span className="calendar-native-select-arrow">▾</span>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
