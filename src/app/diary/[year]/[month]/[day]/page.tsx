import { notFound } from "next/navigation";
import { getPostByDate, getPostDatesByMonth, getCommentsByPostId } from "@/lib/diary";
import { DiaryPage } from "@/components/DiaryPage";

type Props = {
  params: Promise<{ year: string; month: string; day: string }>;
};

export default async function DiaryDatePage({ params }: Props) {
  const { year: yearParam, month: monthParam, day: dayParam } = await params;
  const year = Number(yearParam);
  const month = Number(monthParam);
  const day = Number(dayParam);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    notFound();
  }

  const post = await getPostByDate(year, month, day);
  const monthDays = await getPostDatesByMonth(year, month);
  const comments = post ? await getCommentsByPostId(post.id) : [];

  return (
    <DiaryPage
      initialDate={{ year, month, day }}
      serverPost={post as any}
      monthPostDays={monthDays}
      initialComments={comments}
    />
  );
}
