# 일기 사이트 구축 설계 문서

# IMPORTANT UPDATE

The visual design is now the highest priority.

Do NOT redesign functionality.

Keep all existing features exactly as they are.

Redesign only the UI to closely match the reference website (언니네 이발관).

Requirements:
- nostalgic early-2000s Korean homepage style
- handwritten title
- minimal typography
- thin gray lines
- less rounded corners
- much closer to the reference screenshots
- keep comments, calendar, admin login, Supabase, routes
- add a visible "새 글 쓰기" button for admin



> 이 문서는 ChatGPT, Claude Code, Cursor 등 **어떤 AI 코딩 도구에 줘도 동일하게 작동**하는 일반 기술 명세서입니다. 특정 도구에 종속되지 않았습니다.
> 코딩을 전혀 모르는 분도 따라할 수 있도록 단계(Phase)별로 나눠놨습니다. **한 번에 전체를 주지 말고, Phase 순서대로 하나씩** ChatGPT에게 주세요.

---

## 0. 프로젝트 개요

### 목표
참고 사이트(언니네이발관 공식 홈피의 "일기" 게시판)의 UI를 충실히 재현하면서, 아래 기능을 추가한 개인 일기 사이트 제작.

| 기능 | 내용 |
|---|---|
| 관리자 글쓰기 | 아이디+비밀번호로 로그인한 관리자(나)만 새 일기 작성/수정/삭제 가능 |
| 익명 댓글 | 로그인 없이 누구나 닉네임만 입력하고 댓글(답글) 작성 가능 |
| 사진 첨부 | 관리자가 일기 작성 시 사진 파일을 직접 업로드 |
| 유튜브 첨부 | 관리자가 유튜브 링크를 붙이면 영상이 본문에 임베드되어 재생 |
| 캘린더 네비게이션 | 참고 사이트와 동일하게, 글이 있는 날짜만 굵게 표시되고 클릭하면 해당 날짜 글로 이동 |
| 데이터 영구 저장 | 브라우저가 아니라 클라우드 DB에 저장 — 어떤 기기에서 접속해도 같은 데이터 |

### 기술 스택

```
프론트엔드 + 백엔드   : Next.js (React 기반, 풀스택 프레임워크)
데이터베이스 + 파일저장 : Supabase (무료 티어로 충분, Postgres DB + Storage + 로그인 기능 내장)
배포(호스팅)          : Vercel (무료, GitHub과 연동하면 자동 배포)
코드 저장소           : GitHub (Claude Code/ChatGPT가 만든 코드를 보관, Vercel과 연결하는 다리 역할)
```

**왜 이 조합인가요?**
- Next.js: 화면(프론트엔드)과 서버 기능(로그인 체크, DB 저장)을 한 프로젝트 안에서 같이 짤 수 있어서 구조가 단순함
- Supabase: DB + 로그인 + 파일 업로드를 직접 서버를 만들지 않고도 가입만 하면 바로 사용 가능 (무료 티어: 500MB DB, 1GB 파일 저장 — 개인 일기 사이트로는 넉넉함)
- Vercel: GitHub에 코드를 올리면 자동으로 인터넷에 배포됨, 무료

---

## 1. UI 명세 (참고 사이트 스크린샷 기반)

### 1-1. 전체 레이아웃
- 페이지 좌우에 둥근 모서리(rounded corner)의 흰색 카드형 컨테이너로 전체 콘텐츠를 감쌈
- 카드 바깥은 빈 배경(흰색 또는 아주 옅은 색)

### 1-2. 헤더 영역
- 좌상단: 검정 배경의 정사각형 로고 박스 (바버샵 폴 아이콘 + 캘리그라피 텍스트)
- 로고 옆: 가로 메뉴 — `언니네이발관 | 새소식 | 특집 | 게시판 | 섭외창구` (구분선 `|`로 분리된 텍스트 메뉴)
- 우측: `◀ 처음으로` (홈으로 가는 링크, 연한 골드/베이지 색상)

> 이 사이트는 특정 밴드의 팬/공식 페이지이므로, **실제 구현 시에는 메뉴 텍스트와 로고를 본인 사이트에 맞게 교체**해야 합니다. 레이아웃 구조(로고+메뉴 가로 배치)만 참고하세요.

### 1-3. 페이지 제목
- "일기"라는 제목을 캘리그라피/브러시 폰트로, 짙은 골드/브라운 색상으로 표시
- 제목 아래 가로 구분선 (옅은 회색, 풀 와이드)

### 1-4. 본문 2단 레이아웃 (구분선 아래)
구분선 아래는 **세로 구분선으로 나뉜 좌/우 2단 구조**:

**좌측 (약 65% 너비) — 일기 본문 영역**
- 날짜 헤더: `2016년 3월 7일` (볼드)
- 본문 텍스트: 일반 단락, 줄바꿈 유지
- 날짜 헤더와 본문 사이 약간의 여백

**우측 (약 35% 너비) — 캘린더 위젯**
- 상단: `2016년  3월` (해당 월 표시, 가운데 정렬)
- 요일 행: `日 月 火 水 木 金 土` (일요일은 핑크/마젠타색, 토요일은 파란색, 평일은 검정)
- 날짜 그리드:
  - **글이 있는 날짜는 볼드(굵은 글씨) + 클릭 가능한 링크** (예: 3, 5, 13, 15, 21, 22, 24, 30)
  - **글이 없는 날짜는 일반 글씨, 클릭 불가**
  - 현재 보고 있는 날짜는 색상으로 구분 가능 (선택)
- 캘린더 아래:
  - `이전달 <<` / `>> 다음달` 텍스트 링크 (월 이동)
  - 연도 드롭다운(`2016년 ⌄`) + 월 드롭다운(`3월 ⌄`) — 클릭하면 목록이 펼쳐지고, 현재 선택된 항목에 체크(✓) 표시 및 파란색 배경 강조

### 1-5. URL 구조 (참고용, 그대로 따라할 필요 없음)
원본 사이트는 `?yy=2027&mm=7&dd=13&yyy=2027&mmm=7&ddd=13` 같은 구식 쿼리 파라미터를 쓰지만, 새로 만드는 사이트는 깔끔하게:
```
/diary/2026/6/26     (연/월/일 경로 방식 추천)
```
또는
```
/diary?year=2026&month=6&day=26
```
둘 다 가능하나, **경로 방식**(`/diary/[year]/[month]/[day]`)이 더 현대적이고 SEO에도 좋습니다.

---

## 2. 기능 명세

### 2-1. 관리자 로그인
- 로그인 페이지: 아이디 입력칸 + 비밀번호 입력칸 + 로그인 버튼
- 관리자 계정은 1개만 존재 (본인 전용)
- 로그인 성공 시 세션 유지 → "글쓰기" 버튼이 화면에 나타남
- 로그인하지 않은 일반 방문자에게는 글쓰기/수정/삭제 버튼이 보이지 않음

### 2-2. 글 작성/수정/삭제 (관리자 전용)
입력 항목:
- 날짜 (날짜 선택기, 기본값 오늘)
- 본문 (여러 줄 텍스트)
- 사진 (여러 장 업로드 가능, 미리보기 제공)
- 유튜브 링크 (선택 입력, 붙여넣으면 본문에 자동 임베드)

저장 시 동작:
- DB에 글 저장
- 사진은 Supabase Storage에 업로드 후, 그 주소(URL)를 DB에 같이 저장
- 저장 완료 후 해당 날짜의 일기 페이지로 자동 이동

수정/삭제:
- 본인 글에 "수정" / "삭제" 버튼 표시 (관리자 로그인 상태에서만)

### 2-3. 익명 댓글 (답글)
- 로그인 불필요
- 입력 항목: 닉네임(텍스트), 비밀번호(선택, 4자리 — 나중에 본인이 삭제할 때 사용), 댓글 내용
- 작성 즉시 목록에 표시 (새로고침 없이 보이면 더 좋음)
- 댓글 삭제: 작성 시 입력한 비밀번호가 일치하거나, 관리자 로그인 상태면 삭제 가능

### 2-4. 캘린더 네비게이션
- 해당 월에 글이 존재하는 날짜만 굵게 표시 + 클릭 가능
- 날짜 클릭 → 그 날의 일기 페이지로 이동
- 이전달/다음달 이동
- 연/월 드롭다운으로 즉시 이동

---

## 3. 데이터베이스 설계 (Supabase / PostgreSQL)

Supabase 프로젝트 생성 후, **SQL Editor**에 아래 코드를 그대로 붙여넣고 실행하면 테이블이 만들어집니다.

```sql
-- 일기 글 테이블
create table posts (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  content text not null,
  youtube_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 일기에 첨부된 사진 테이블 (한 글에 여러 장 가능)
create table post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 익명 댓글 테이블
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  nickname text not null default '익명',
  delete_password text, -- 댓글 작성자가 본인 댓글 지울 때 쓰는 4자리 비밀번호 (해시 권장)
  content text not null,
  created_at timestamptz default now()
);

-- 날짜별 글 존재 여부를 빠르게 조회하기 위한 인덱스
create index idx_posts_entry_date on posts(entry_date);
create index idx_comments_post_id on comments(post_id);
```

**보안 설정 (RLS, Row Level Security)**
Supabase는 기본적으로 RLS를 켜는 걸 권장합니다. 아래 정책을 추가하세요:

```sql
alter table posts enable row level security;
alter table post_images enable row level security;
alter table comments enable row level security;

-- 누구나 읽기 가능
create policy "공개 읽기 - posts" on posts for select using (true);
create policy "공개 읽기 - post_images" on post_images for select using (true);
create policy "공개 읽기 - comments" on comments for select using (true);

-- 누구나 댓글 쓰기 가능 (익명 댓글 기능)
create policy "누구나 댓글 작성" on comments for insert with check (true);

-- 글 작성/수정/삭제는 관리자만 (서버 코드에서 별도로 인증 체크, 자세한 내용은 Phase 5에서 ChatGPT가 구현)
create policy "관리자만 글 작성" on posts for insert with check (auth.role() = 'authenticated');
create policy "관리자만 글 수정" on posts for update using (auth.role() = 'authenticated');
create policy "관리자만 글 삭제" on posts for delete using (auth.role() = 'authenticated');
```

**관리자 계정 만들기**
- Supabase 대시보드 → Authentication → Users → "Add user"에서 본인 이메일/비밀번호로 1개 계정 생성
- 이 계정으로 로그인한 사람만 글쓰기 가능

**파일(사진) 저장소**
- Supabase 대시보드 → Storage → "New bucket" → 이름 `diary-images` → Public bucket 체크

---

## 4. 페이지 구조 (Next.js App Router 기준)

```
/                              → /diary로 리다이렉트 또는 최신 글로 이동
/diary/[year]/[month]/[day]    → 특정 날짜 일기 보기 (메인 화면, 좌측 본문+우측 캘린더)
/admin/login                   → 관리자 로그인 페이지
/admin/write                   → 새 글 작성 (로그인 필요)
/admin/edit/[id]               → 글 수정 (로그인 필요)
```

서버 기능 (Next.js Server Actions로 구현 — 별도 API 서버를 안 만들어도 됨):
- `createPost()` — 글 생성 (사진 업로드 포함)
- `updatePost()` — 글 수정
- `deletePost()` — 글 삭제
- `createComment()` — 댓글 생성
- `deleteComment()` — 댓글 삭제 (비밀번호 또는 관리자 확인)
- `getPostsByMonth(year, month)` — 캘린더에 표시할, 해당 월에 글이 있는 날짜 목록 조회

---

## 5. 단계별 구현 로드맵 (Phase 0~8)

> **사용법**: 각 Phase의 "ChatGPT에게 줄 프롬프트"를 그대로 복사해서 ChatGPT 새 대화에 붙여넣으세요. 이 설계문서 전체를 먼저 한 번 공유하고("이 프로젝트를 같이 만들 거야, 아래는 전체 설계문서야"), 그 다음에 Phase별로 진행하면 ChatGPT가 맥락을 잃지 않습니다.
>
> ChatGPT가 코드와 "터미널에 이 명령어를 입력하세요"라는 안내를 줄 거예요. 코딩을 몰라도, **시키는 대로 복붙하고 결과(에러 메시지 포함)를 그대로 다시 ChatGPT에 붙여넣으면** 됩니다.

### Phase 0. 계정 준비
- [ ] GitHub.com 가입
- [ ] Supabase.com 가입 → "New Project" 생성 → 프로젝트 이름/비밀번호 설정 (이 비밀번호는 DB 접속용이니 따로 메모)
- [ ] Vercel.com 가입 (GitHub 계정으로 로그인하면 편함)
- [ ] Supabase 대시보드 → Settings → API에서 `Project URL`과 `anon public key` 복사해서 메모장에 저장 (나중에 Phase 1에서 사용)

### Phase 1. 프로젝트 뼈대 만들기
**ChatGPT에게 줄 프롬프트:**
```
나는 코딩을 전혀 모르는 디자이너야. 내 컴퓨터(Mac/Windows - 본인 OS 명시)에
터미널을 처음부터 여는 법부터 알려주고, Next.js + Supabase로 프로젝트를
시작하는 방법을 한 단계씩, 입력할 명령어를 정확히 알려줘.
프로젝트 이름은 "my-diary"로 할 거야.
```
이 단계가 끝나면: 컴퓨터에 프로젝트 폴더가 생기고, 로컬에서 빈 화면이 브라우저에 뜸

### Phase 2. 환경변수 연결
Supabase URL/Key를 프로젝트에 연결하는 단계.
**ChatGPT에게 줄 프롬프트:**
```
.env.local 파일을 만들어서 Supabase 프로젝트랑 연결하고 싶어.
내 Supabase URL은 [복사한 URL 붙여넣기]고
anon key는 [복사한 키 붙여넣기]야.
Supabase 클라이언트 설정 코드도 만들어줘.
```

### Phase 3. DB 테이블 생성
위 "3. 데이터베이스 설계"의 SQL 코드를 Supabase 대시보드 → SQL Editor에 직접 붙여넣고 실행 (ChatGPT 필요 없음, 그냥 복붙)

### Phase 4. UI 정적 화면 만들기 (더미 데이터로)
**ChatGPT에게 줄 프롬프트:**
```
아래는 내가 만들고 싶은 일기 사이트의 UI 명세야 (위 "1. UI 명세" 섹션 전체 붙여넣기).
이 명세대로 더미 데이터(가짜 일기 글 2~3개)를 이용해서
/diary 페이지의 화면(좌측 본문 + 우측 캘린더)을 Next.js + Tailwind CSS로 만들어줘.
아직 DB 연결은 하지 말고, 일단 화면만 명세에 맞게 만들어줘.
```
이 단계에서 디자인 피드백을 계속 주고받으며 다듬으세요 (폰트, 색상, 여백 등).

### Phase 5. 실제 DB 연결 (글 읽기)
**ChatGPT에게 줄 프롬프트:**
```
이제 Phase 4에서 만든 화면을 실제 Supabase DB와 연결해줘.
/diary/[year]/[month]/[day] 경로로 접속하면 그 날짜의 글을 DB에서 가져와서 보여주고,
캘린더는 해당 월에 글이 있는 날짜만 굵게 표시되게 해줘.
DB 테이블 구조는 위 "3. 데이터베이스 설계" 섹션을 참고해.
```

### Phase 6. 관리자 로그인 + 글쓰기 기능
**ChatGPT에게 줄 프롬프트:**
```
Supabase Auth를 이용한 관리자 로그인 페이지(/admin/login)를 만들어줘.
로그인하면 /admin/write에서 새 글을 작성할 수 있어야 하고,
입력 항목은 날짜, 본문, 사진(여러 장 업로드), 유튜브 링크(선택)야.
사진은 Supabase Storage의 'diary-images' 버킷에 업로드하고,
유튜브 링크는 본문에 자동으로 임베드되게 해줘.
로그인 안 한 사람한테는 글쓰기/수정/삭제 버튼이 안 보여야 해.
```

### Phase 7. 익명 댓글 기능
**ChatGPT에게 줄 프롬프트:**
```
각 일기 글 아래에 댓글 영역을 추가해줘.
로그인 없이 닉네임 + (선택)4자리 비밀번호 + 댓글 내용을 입력해서 작성할 수 있어야 하고,
작성한 비밀번호를 입력하면 본인 댓글을 삭제할 수 있어야 해.
관리자로 로그인한 상태면 비밀번호 없이도 모든 댓글을 삭제할 수 있게 해줘.
```

### Phase 8. 배포
**ChatGPT에게 줄 프롬프트:**
```
이 프로젝트를 GitHub에 올리고 Vercel에 배포하는 방법을 처음부터 끝까지
명령어와 클릭할 위치까지 정확히 알려줘. 환경변수도 Vercel에 설정해야 하는데
그 방법도 알려줘.
```
배포가 끝나면 `https://my-diary.vercel.app` 같은 실제 URL이 생기고, 누구나 그 주소로 접속해서 일기를 보고 댓글을 남길 수 있습니다.

---

## 6. 환경변수 정리 (Phase 2, 8에서 사용)

```
NEXT_PUBLIC_SUPABASE_URL=Supabase 대시보드에서 복사
NEXT_PUBLIC_SUPABASE_ANON_KEY=Supabase 대시보드에서 복사
```
이 두 값은 절대 공개 채팅이나 공개 GitHub 저장소에 평문으로 올리지 말고, `.env.local` 파일(로컬)과 Vercel 대시보드의 "Environment Variables" 설정에만 넣으세요.

---

## 7. 막혔을 때

- 에러 메시지가 뜨면 **전체 메시지를 그대로 복사**해서 ChatGPT에 "이런 에러가 떴어"라고 붙여넣기 — 일부만 복사하면 진단이 어려워집니다
- 화면이 이상하게 보이면 **스크린샷을 찍어서** "여기가 이렇게 깨졌어"라고 보여주기
- 막힌 단계의 Phase 번호를 같이 언급하면 ChatGPT가 맥락을 더 잘 잡습니다 (예: "Phase 6 하다가 로그인이 안 돼")

---

## 8. UI 미세 조정 가이드 (디자이너용)

코드를 몰라도 아래 방식으로 계속 디자인을 다듬을 수 있습니다.

1. **말로 설명**: "캘린더 숫자가 너무 커, 14px 정도로 줄여줘", "본문과 캘린더 사이 구분선을 점선으로 바꿔줘"
2. **스크린샷 + 화살표 표시**: 현재 화면을 캡처하고 그림판/Figma로 화살표나 동그라미 표시해서 "여기 여백을 넓혀줘"
3. **레퍼런스 이미지 첨부**: 원하는 폰트/색감의 다른 사이트 캡처를 보여주며 "이 느낌으로"
4. **구체적 수치 요청**: 정확한 사양이 있다면 "padding 16px, 폰트 14px, 색상 #333333"처럼 구체적으로 — 더 빠르고 정확하게 반영됩니다
