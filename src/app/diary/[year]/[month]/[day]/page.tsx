import { notFound } from "next/navigation";
import { getPostByDate, getPostDatesByMonth, getCommentsByPostId } from "@/lib/diary";
import { DiaryPage } from "@/components/DiaryPage";

export default async function DiaryDatePage({ params }: { params: { year: string; month: string; day: string } }) {
  const year = Number(params.year);
  const month = Number(params.month);
  const day = Number(params.day);

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
