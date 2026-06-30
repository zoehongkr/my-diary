-- Supabase schema for my-diary Phase 3

-- 일기 글 테이블
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  content text not null,
  title text,
  youtube_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 일기에 첨부된 사진 테이블 (한 글에 여러 장 가능)
create table if not exists post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 익명 댓글 테이블
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  nickname text not null default '익명',
  delete_password text,
  content text not null,
  created_at timestamptz default now()
);

-- 날짜별 글 존재 여부를 빠르게 조회하기 위한 인덱스
create index if not exists idx_posts_entry_date on posts(entry_date);
create index if not exists idx_comments_post_id on comments(post_id);

-- RLS 정책 setup guidance
-- Supabase SQL Editor에서 아래 명령을 실행하여 RLS와 공개 읽기/관리자 작성 정책을 추가하세요.

-- alter table posts enable row level security;
-- alter table post_images enable row level security;
-- alter table comments enable row level security;

-- create policy "공개 읽기 - posts" on posts for select using (true);
-- create policy "공개 읽기 - post_images" on post_images for select using (true);
-- create policy "공개 읽기 - comments" on comments for select using (true);

-- create policy "누구나 댓글 작성" on comments for insert with check (true);

-- create policy "관리자만 글 작성" on posts for insert with check (auth.role() = 'authenticated');
-- create policy "관리자만 글 수정" on posts for update using (auth.role() = 'authenticated');
-- create policy "관리자만 글 삭제" on posts for delete using (auth.role() = 'authenticated');
