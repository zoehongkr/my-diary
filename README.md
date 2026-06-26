This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deployment (Phase 8) — GitHub + Vercel

Follow these steps to publish this project to GitHub and deploy on Vercel.

1. Initialize git, commit, and push to a new GitHub repository (replace <your-repo-url>):

```bash
git init
git add .
git commit -m "Initial commit: my-diary"
# create repo on GitHub via web UI and copy the repo URL, then:
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

2. Create a Vercel project:

- Go to https://vercel.com/new and import your GitHub repository.
- During setup, choose the `my-diary` repository and the `main` branch.

3. Add required Environment Variables in Vercel:

- In the Vercel dashboard for your project, open Settings → Environment Variables.
- Add the following variables (both for `Production` and `Preview`):

	- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase Project URL
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon public key

	These values come from Supabase → Project → Settings → API.

4. Trigger a deploy:

- Push any commit to `main` (or open a PR) and Vercel will automatically build and deploy.
- You can also click "Deploy" in the Vercel project page to run a fresh build.

5. Verify:

- Once deployment finishes, open the provided Vercel URL (e.g., `https://my-diary.vercel.app`).
- Visit `/admin/login` to sign in with your Supabase admin user (create one via Supabase Auth if needed).

Notes and troubleshooting
- Do NOT commit secret keys to GitHub. Keep keys only in Vercel environment variables and your local `.env.local`.
- If you need to run migrations or create DB tables, use the Supabase SQL Editor (see `PROJECT_SPEC.md` Phase 3).
- If images don't appear, ensure your Supabase Storage bucket (`diary-images`) is public or generate signed URLs in server code.

If you want, I can prepare a small `GITHUB_PUSH.md` with exact steps for creating the repo via GitHub CLI or web UI, or I can add a `vercel.json` with recommended settings. Which would you prefer?
