# Alternative Solution: Move Next.js App to Root

If the Vercel configuration fixes don't work, you can:

1. Move all files from `frontend-web/` to the root directory
2. Update `package.json` in root to match `frontend-web/package.json`
3. Delete the `vercel.json` file (Vercel will auto-detect Next.js)
4. Redeploy

This is the cleanest solution for monorepos with a single frontend.



