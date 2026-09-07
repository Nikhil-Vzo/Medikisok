# MediKiosk — Production Deployment Guide (Vercel & Render)

This project is built on **Next.js 14 (App Router)** with serverless API routes, Supabase integration, and multimodal AI services (Gemini, Groq, Bhashini, PaddleOCR, ABDM).

You can deploy MediKiosk seamlessly to either **Vercel** or **Render** (or both).

---

## Deployment Configuration Summary

| Platform | Deployment Type | Primary Config File | Ignore File |
| :--- | :--- | :--- | :--- |
| **Vercel** | Serverless Next.js App | [`vercel.json`](file:///c:/Users/nikhi/Downloads/SIH26047-MediKiosk/vercel.json) | [`.vercelignore`](file:///c:/Users/nikhi/Downloads/SIH26047-MediKiosk/.vercelignore) |
| **Render (Blueprint)** | Infrastructure as Code | [`render.yaml`](file:///c:/Users/nikhi/Downloads/SIH26047-MediKiosk/render.yaml) | — |
| **Render (Docker)** | Containerized Standalone | [`Dockerfile`](file:///c:/Users/nikhi/Downloads/SIH26047-MediKiosk/Dockerfile) | [`.dockerignore`](file:///c:/Users/nikhi/Downloads/SIH26047-MediKiosk/.dockerignore) |

---

## 1. Deploying to Vercel (Recommended for Next.js)

Vercel provides native edge caching, instant preview branches, and automatic HTTPS.

### Method A: Via Vercel Dashboard (Easiest)

1. Push your project to a GitHub / GitLab / Bitbucket repository.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your MediKiosk repository.
4. Vercel automatically detects **Next.js**. Keep the default settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
5. Expand **Environment Variables** and paste the keys from your `.env.local` or [`.env.example`](file:///c:/Users/nikhi/Downloads/SIH26047-MediKiosk/.env.example):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`
   - `BHASHINI_API_KEY`
   - `BHASHINI_ENDPOINT`
   - `ABDM_CLIENT_ID`
   - `ABDM_CLIENT_SECRET`
   - `PADDLEOCR_API_KEY`
   - `ADMIN_SECRET`
6. Click **Deploy**. Vercel will build and assign you a production URL (e.g. `https://medikiosk.vercel.app`).

### Method B: Via Vercel CLI

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Login to your account
vercel login

# Link and deploy preview
vercel

# Deploy to production
vercel --prod
```

---

## 2. Deploying to Render

Render is ideal for persistent web services, custom Docker containers, and predictable pricing.

### Method A: Using Render Blueprint (One-Click Setup via `render.yaml`)

The repository includes a pre-configured [`render.yaml`](file:///c:/Users/nikhi/Downloads/SIH26047-MediKiosk/render.yaml).

1. Push your repository to GitHub / GitLab.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New +** → **Blueprint**.
3. Connect your repository.
4. Render will read `render.yaml` and configure:
   - **Service Name**: `medikiosk`
   - **Runtime**: Node.js (`v20.16.0`)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Health Check Path**: `/api/ocr/status`
5. Enter the values for the prompted environment variables marked `sync: false`.
6. Click **Apply**. Render will automatically provision and deploy the web service.

### Method B: Manual Web Service (Node.js)

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your Git repository.
3. Configure service parameters:
   - **Language**: `Node`
   - **Node Version**: `20.16.0` (or add environment variable `NODE_VERSION=20.16.0`)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Health Check Path**: `/api/ocr/status`
4. Add all environment variables from [`.env.example`](file:///c:/Users/nikhi/Downloads/SIH26047-MediKiosk/.env.example).
5. Click **Create Web Service**.

### Method C: Containerized Deployment (Docker)

If you prefer containerized deployment or want to minimize Render memory spikes during build:

1. The project includes a production multi-stage [`Dockerfile`](file:///c:/Users/nikhi/Downloads/SIH26047-MediKiosk/Dockerfile) optimized with Next.js standalone mode.
2. In Render Dashboard, click **New +** → **Web Service**.
3. Select **Docker** as the runtime (Render will automatically detect `Dockerfile`).
4. Set the Health Check Path to `/api/ocr/status`.
5. Add your environment variables and click **Create Web Service**.

---

## 3. Environment Variables Reference

Ensure all required secrets are provided in your hosting provider's dashboard:

| Variable | Required | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Supabase project URL (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase anonymous public key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase service role secret (backend only) |
| `GEMINI_API_KEY` | **Yes** | Google Gemini AI API key for multimodal intake |
| `GROQ_API_KEY` | **Yes** | Groq API key for Llama 3.1 clinical SOAP summary |
| `BHASHINI_API_KEY` | Optional | AI4Bharat Bhashini key for voice recognition & TTS |
| `BHASHINI_ENDPOINT` | Optional | Bhashini API base endpoint |
| `ABDM_CLIENT_ID` | Optional | ABDM sandbox client ID for ABHA card creation |
| `ABDM_CLIENT_SECRET` | Optional | ABDM sandbox secret key |
| `PADDLEOCR_API_KEY` | Optional | PaddleOCR API key for printed prescription OCR |
| `ADMIN_SECRET` | **Yes** | Passphrase protecting the `/admin` route |

---

## 4. Post-Deployment Supabase Configuration

Once your app is deployed and you have your live URL (e.g., `https://medikiosk.vercel.app` or `https://medikiosk.onrender.com`):

1. Go to your **[Supabase Dashboard](https://app.supabase.com/)** → **Project Settings** → **Authentication**.
2. Under **URL Configuration**:
   - **Site URL**: Update to your deployed production URL.
   - **Redirect URLs**: Add your production domain (e.g. `https://your-domain.vercel.app/**`).
3. Under **API** → **CORS allowed origins**:
   - Add your live deployment URL if you make direct browser requests to Supabase storage or endpoints.

---

## 5. Deployment Verification Checklist

After deploying, verify the following endpoints:

- [ ] **Home Page**: Navigate to `/` — Check landing page and navigation cards.
- [ ] **Health Status**: Navigate to `/api/ocr/status` — Should return JSON with service availability.
- [ ] **Patient Kiosk**: Navigate to `/kiosk` — Test intake flow and voice/text input.
- [ ] **Doctor Portal**: Navigate to `/doctor` — Verify patient queue and SOAP notes rendering.
- [ ] **Admin Dashboard**: Navigate to `/admin` — Verify prompt for `ADMIN_SECRET` works and protects the page.
