import { notFound } from "next/navigation";
import { getPostsByDate, getPostDatesByMonth } from "@/lib/diary";
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

  const posts = await getPostsByDate(year, month, day);
  const monthDays = await getPostDatesByMonth(year, month);

  return (
    <DiaryPage
      initialDate={{ year, month, day }}
      serverPosts={posts}
      monthPostDays={monthDays}
    />
  );
}
