import { DiaryPage } from "@/components/DiaryPage";
import { getPostsByDate, getPostDatesByMonth } from "@/lib/diary";

export const dynamic = "force-dynamic";

export default async function DiaryRoute() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const [posts, monthDays] = await Promise.all([
    getPostsByDate(year, month, day),
    getPostDatesByMonth(year, month),
  ]);

  return (
    <DiaryPage
      initialDate={{ year, month, day }}
      serverPosts={posts}
      monthPostDays={monthDays}
    />
  );
}
