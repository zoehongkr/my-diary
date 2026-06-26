import { supabaseClient } from "@/lib/supabaseClient";

type PostRow = {
  id: string;
  entry_date: string;
  content: string;
  youtube_url: string | null;
  created_at: string;
  updated_at: string;
  post_images?: Array<{
    id: string;
    image_url: string;
    sort_order: number;
  }>;
};

export type DiaryPost = {
  id: string;
  entryDate: string;
  content: string;
  youtubeUrl: string | null;
  images: Array<{ id: string; imageUrl: string; sortOrder: number }>;
  createdAt: string;
};

export type MonthPostDate = {
  day: number;
};

type CommentRow = {
  id: string;
  post_id: string;
  nickname: string;
  delete_password: string | null;
  content: string;
  created_at: string;
};

export async function getLatestPostDate() {
  const { data, error } = await supabaseClient
    .from("posts")
    .select("entry_date")
    .order("entry_date", { ascending: false })
    .limit(1)
    .single();

  const row = data as PostRow | null;
  if (error || !row?.entry_date) {
    return null;
  }

  const entryDate = new Date(row.entry_date);
  return {
    year: entryDate.getUTCFullYear(),
    month: entryDate.getUTCMonth() + 1,
    day: entryDate.getUTCDate(),
  };
}

export async function getPostsByDate(year: number, month: number, day: number) {
  const isoDate = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
  const { data, error } = await supabaseClient
    .from("posts")
    .select("*, post_images(*)")
    .eq("entry_date", isoDate)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [] as DiaryPost[];
  }

  return data.map((row) => {
    const typedRow = row as PostRow;
    return {
      id: typedRow.id,
      entryDate: typedRow.entry_date,
      content: typedRow.content,
      youtubeUrl: typedRow.youtube_url,
      createdAt: typedRow.created_at,
      images: typedRow.post_images?.map((image) => ({
        id: image.id,
        imageUrl: image.image_url,
        sortOrder: image.sort_order,
      })) ?? [],
    } as DiaryPost;
  });
}

export async function getPostDatesByMonth(year: number, month: number) {
  const startDate = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-01`;
  // Calculate last day of the provided month. `month` is 1-indexed, so pass month+1
  // to Date.UTC and use day 0 to get the last day of the target month.
  const endDate = new Date(Date.UTC(year, month + 1, 0));
  const lastDay = endDate.getUTCDate();
  const endDateIso = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${lastDay
    .toString()
    .padStart(2, "0")}`;

  const { data, error } = await supabaseClient
    .from("posts")
    .select("entry_date")
    .gte("entry_date", startDate)
    .lte("entry_date", endDateIso)
    .order("entry_date", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data
    .map((row) => Number(row.entry_date.split("-")[2]))
    .filter((day): day is number => Number.isInteger(day));
}

export async function getCommentsByPostId(postId: string) {
  const { data, error } = await supabaseClient
    .from("comments")
    .select("id, post_id, nickname, content, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [] as Array<{
      id: string;
      nickname: string;
      content: string;
      created_at: string;
    }>;
  }

  return data as Array<{
    id: string;
    nickname: string;
    content: string;
    created_at: string;
  }>;
}

export async function uploadDiaryImages(files: File[]) {
  const uploadPromises = files.map(async (file, index) => {
    const filePath = `${Date.now()}-${index}-${file.name}`;

    const { data, error } = await supabaseClient.storage
      .from("diary-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error || !data) {
      throw new Error(error?.message ?? "이미지 업로드에 실패했습니다.");
    }

    const { data: urlData } = supabaseClient.storage
      .from("diary-images")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("이미지 URL 생성에 실패했습니다.");
    }

    return urlData.publicUrl;
  });

  return Promise.all(uploadPromises);
}

export async function createPost({
  entryDate,
  content,
  youtubeUrl,
  imageUrls,
}: {
  entryDate: string;
  content: string;
  youtubeUrl: string | null;
  imageUrls: string[];
}) {
  const { data, error } = await supabaseClient
    .from("posts")
    .insert([
      {
        entry_date: entryDate,
        content,
        youtube_url: youtubeUrl,
      },
    ])
    .select("id");

  if (error || !data?.[0]?.id) {
    return { error: error ?? new Error("게시물 생성에 실패했습니다.") };
  }

  const postId = data[0].id;

  if (imageUrls.length > 0) {
    const imageInsert = imageUrls.map((imageUrl, index) => ({
      post_id: postId,
      image_url: imageUrl,
      sort_order: index,
    }));

    const { error: imageError } = await supabaseClient
      .from("post_images")
      .insert(imageInsert);

    if (imageError) {
      return { error: imageError };
    }
  }

  return { data: { id: postId }, error: null };
}

export async function getPostById(postId: string) {
  const { data, error } = await supabaseClient
    .from("posts")
    .select("*, post_images(*)")
    .eq("id", postId)
    .single();

  if (error || !data) return null;

  const row = data as PostRow;

  return {
    id: row.id,
    entryDate: row.entry_date,
    content: row.content,
    youtubeUrl: row.youtube_url,
    images: row.post_images?.map((image) => ({
      id: image.id,
      imageUrl: image.image_url,
      sortOrder: image.sort_order,
    })) ?? [],
  } as DiaryPost;
}

export async function updatePost(postId: string, {
  entryDate,
  content,
  youtubeUrl,
  imageUrls,
}: {
  entryDate: string;
  content: string;
  youtubeUrl: string | null;
  imageUrls?: string[] | null; // if undefined -> leave images unchanged; if [] -> remove all
}) {
  const { error } = await supabaseClient
    .from("posts")
    .update({ entry_date: entryDate, content, youtube_url: youtubeUrl })
    .eq("id", postId);

  if (error) return { error };

  if (imageUrls !== undefined) {
    // remove existing images
    const { error: delErr } = await supabaseClient.from("post_images").delete().eq("post_id", postId);
    if (delErr) return { error: delErr };

    if (imageUrls && imageUrls.length > 0) {
      const imageInsert = imageUrls.map((imageUrl, index) => ({
        post_id: postId,
        image_url: imageUrl,
        sort_order: index,
      }));

      const { error: insertErr } = await supabaseClient.from("post_images").insert(imageInsert);
      if (insertErr) return { error: insertErr };
    }
  }

  return { data: { id: postId }, error: null };
}

export async function deletePost(postId: string) {
  const { error } = await supabaseClient.from("posts").delete().eq("id", postId);
  if (error) return { error };
  return { data: { id: postId }, error: null };
}
