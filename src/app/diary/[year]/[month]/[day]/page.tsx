import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostByDate, getPostDatesByMonth, getCommentsByPostId } from "@/lib/diary";
import Comments from "@/components/Comments";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateLabel(year: number, month: number, day: number) {
  return `${year}년 ${month}월 ${day}일`;
}

function createCalendarRows(year: number, month: number) {
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const rows: Array<Array<number | null>> = [];
  let week: Array<number | null> = Array(firstDay).fill(null);

  for (let date = 1; date <= daysInMonth; date += 1) {
    week.push(date);
    if (week.length === 7) {
      rows.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    rows.push(week);
  }

  return rows;
}

function getYoutubeEmbedUrl(url?: string | null) {
  if (!url) return null;
  const youtubeMatch = url.match(/(?:youtu\.be\/(.+)|youtube\.com\/(?:watch\?v=|embed\/)([^&\n?#]+))/);
  const videoId = youtubeMatch ? youtubeMatch[1] || youtubeMatch[2] : null;
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

export default async function DiaryDatePage({
  params,
}: {
  params: { year: string; month: string; day: string };
}) {
  const year = Number(params.year);
  const month = Number(params.month);
  const day = Number(params.day);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    notFound();
  }

  const post = await getPostByDate(year, month, day);
  const monthDays = await getPostDatesByMonth(year, month);
  const monthDateSet = new Set(monthDays);
  const calendarRows = createCalendarRows(year, month);

  if (!post && !monthDateSet.has(day)) {
    // If the requested date has no post, still render the calendar and empty message.
  }

  const prevMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const embedUrl = getYoutubeEmbedUrl(post?.youtubeUrl ?? null);

  return (
    <div className="min-h-screen bg-[#f7f4ef] px-4 py-8 text-[#1c1b18] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-[#d8d0c1] bg-white p-5 shadow-[0_18px_80px_rgba(98,81,55,0.08)] sm:p-8">
        <header className="flex flex-col gap-5 border-b border-[#e7e0d2] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#1f1a17] text-sm font-bold uppercase tracking-[0.22em] text-[#f8e6c8]">
              LOGO
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
          <Link
            href="/diary"
            className="inline-flex items-center rounded-full bg-[#f8ecd5] px-4 py-2 text-sm font-semibold text-[#5f4b35] shadow-sm shadow-[#d6c2a3]/50"
          >
            ◀ 처음으로
          </Link>
        </header>

        <main className="mt-8 grid gap-8 lg:grid-cols-[0.65fr_0.35fr] lg:gap-10">
          <section className="space-y-6 border border-[#e7e0d2] bg-[#fbf7f0] p-8 text-[#221f1a] shadow-[0_18px_50px_rgba(101,76,34,0.08)]">
            <div className="space-y-4">
              <h1 className="text-[min(3.4rem,6vw)] font-serif text-[#7b541f] leading-tight">일기</h1>
              <div className="h-px w-full bg-[#d8d0c1]" />
            </div>

            <article>
              <div className="mb-5">
                <p className="text-sm font-semibold text-[#5f4b35]">{formatDateLabel(year, month, day)}</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#2f2314]">
                  {post ? "오늘의 일기" : "일기가 존재하지 않습니다."}
                </h2>
              </div>

              {post ? (
                <>
                  {embedUrl ? (
                    <div className="mb-5 aspect-video overflow-hidden rounded-3xl bg-black">
                      <iframe
                        className="h-full w-full"
                        src={embedUrl}
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
                          <img
                            key={image.id}
                            src={image.imageUrl}
                            alt="Diary image"
                            className="h-64 w-full rounded-3xl object-cover"
                          />
                        ))}
                    </div>
                  ) : null}

                  <div className="space-y-5 text-sm leading-8 text-[#40382f]">
                    {post.content.split("\n").map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                  <Comments postId={post.id} initial={await getCommentsByPostId(post.id)} />
                </>
              ) : (
                <div className="rounded-3xl border border-[#e7e0d2] bg-[#fff6eb] p-6 text-[#4c3f30]">
                  <p>해당 날짜에는 아직 작성된 일기가 없습니다.</p>
                  <p className="mt-3 text-sm text-[#7b6a54]">캘린더에서 다른 날짜를 선택하거나, 관리자 기능으로 새 글을 등록하세요.</p>
                </div>
              )}
            </article>
          </section>

          <aside className="rounded-[32px] border border-[#e7e0d2] bg-[#fcfaf6] p-6 shadow-[0_18px_50px_rgba(101,76,34,0.08)]">
            <div className="text-center text-sm font-semibold text-[#5f4b35]">
              {year}년&nbsp;{month}월
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#5f4b35]">
              {daysOfWeek.map((dayLabel, index) => (
                <div key={dayLabel} className={index === 0 ? "text-[#be5b8a]" : index === 6 ? "text-[#3b5fbc]" : "text-[#2e2a24]"}>
                  {dayLabel}
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {calendarRows.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {week.map((date, dateIndex) => {
                    if (date === null) {
                      return <div key={dateIndex} className="h-10 rounded-2xl bg-transparent" />;
                    }

                    const hasPost = monthDateSet.has(date);
                    const isSelected = date === day;
                    const isSunday = dateIndex === 0;
                    const isSaturday = dateIndex === 6;
                    const dayClasses = isSelected
                      ? "bg-[#7b541f] text-white"
                      : hasPost
                      ? "bg-[#fff6eb] text-[#423627] hover:bg-[#f1e3cb]"
                      : "bg-transparent text-[#b8b0a4]";

                    return hasPost ? (
                      <Link
                        key={dateIndex}
                        href={`/diary/${year}/${month}/${date}`}
                        className={`h-10 rounded-2xl text-sm font-semibold transition ${dayClasses} ${isSunday ? "text-[#be5b8a]" : isSaturday ? "text-[#3b5fbc]" : ""}`}
                      >
                        {date}
                      </Link>
                    ) : (
                      <div
                        key={dateIndex}
                        className={`flex h-10 items-center justify-center rounded-2xl text-sm font-semibold ${dayClasses} ${isSunday ? "text-[#be5b8a]" : isSaturday ? "text-[#3b5fbc]" : ""}`}
                      >
                        {date}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between text-sm font-semibold text-[#5f4b35]">
              <Link href={`/diary/${prevMonth.year}/${prevMonth.month}/${Math.min(day, 28)}`} className="text-left hover:text-[#7b541f]">
                이전달 &lt;&lt;
              </Link>
              <Link href={`/diary/${nextMonth.year}/${nextMonth.month}/${Math.min(day, 28)}`} className="text-right hover:text-[#7b541f]">
                &gt;&gt; 다음달
              </Link>
            </div>

            <div className="mt-5 space-y-3 text-sm text-[#3d3428]">
              <div className="relative">
                <div className="w-full rounded-2xl border border-[#d8d0c1] bg-white px-4 py-3 text-left shadow-sm">
                  {year}년
                </div>
              </div>
              <div className="relative">
                <div className="w-full rounded-2xl border border-[#d8d0c1] bg-white px-4 py-3 text-left shadow-sm">
                  {month}월
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
