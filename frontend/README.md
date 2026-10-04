# Littlelink

Full-stack URL shortener: React, Vite, Tailwind CSS, Express, and MongoDB.

## Local development

1. Create a Google OAuth **Web application** client ID. Add
   `http://localhost:5173` as an authorized JavaScript origin.
2. Copy `.env.example` to `.env.local`; set `VITE_GOOGLE_CLIENT_ID`.
   `VITE_SHORT_URL_BASE` should be `http://localhost:5000` locally.
3. Add `GOOGLE_CLIENT_ID` and a random `JWT_SECRET` (at least 32 characters)
   from `../backend/.env.example` to `../backend/.env`. Keep the existing
   `MONGO_URI`. Generate a secret with:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

4. Run `npm run dev` in both `backend/` and `frontend/`.

## Deploy a demo (Vercel + Render + MongoDB Atlas)

1. Push this project to a GitHub repository. In Render, create a Blueprint
   from the repository; it will use the root `render.yaml`. Set `MONGO_URI`
   to a MongoDB Atlas connection string, `GOOGLE_CLIENT_ID` to your Google
   OAuth client ID, and `FRONTEND_ORIGINS` to your exact Vercel site origin,
   for example `https://littlelink-demo.vercel.app` (no trailing slash).
   Render generates `JWT_SECRET`.
2. In Vercel, import the same repository and set **Root Directory** to
   `frontend`. Add these project environment variables:
   - `BACKEND_URL`: Render service URL, e.g. `https://littlelink-api.onrender.com`
   - `VITE_GOOGLE_CLIENT_ID`: the same Google client ID
   - `VITE_SHORT_URL_BASE`: the Render service URL, without a trailing slash
   Leave `VITE_API_BASE_URL` unset: the Vercel function at `frontend/api/`
   proxies `/api` on the same origin, allowing the HttpOnly session cookie to
   work without third-party-cookie blocking.
3. In Google Cloud Console, add the exact Vercel site origin to the OAuth
   client's authorized JavaScript origins. Keep `http://localhost:5173` too
   if you still want local sign-in.
4. Deploy Vercel again after adding its environment variables. Verify
   `https://YOUR-RENDER-SERVICE/api/health` reports a connected database.
5. Test the deployed Vercel URL: Google sign-in, create a link, open its
   Render short URL, check **My links** and click stats, then sign out.

Allow the Render service to reach Atlas in its Network Access settings and
use a database user with only the permissions this app needs. Keep `.env`
files and secrets out of GitHub and LinkedIn. The Vercel API proxy and the
Render service must both be deployed for the public demo to work.
