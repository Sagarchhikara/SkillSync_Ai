# SkillSync AI Deployment Guide

This guide covers how to deploy the SkillSync AI application. The app consists of a **Vite + React** frontend and a **Node.js (Express) + MongoDB + Firebase** backend.

A common and free/low-cost approach is to deploy the **Frontend on Vercel** and the **Backend on Render**.

## 1. Code Preparation

Before deploying, you need to make your frontend API URL dynamic so it can connect to the deployed backend instead of `localhost`.

1. Open `frontend/src/services/api.ts`.
2. Update the `baseURL` to use Vite's environment variables:

```typescript
const api = axios.create({
  // Change from hardcoded localhost to:
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
```

## 2. Deploy the Backend (Node.js on Render)

We recommend using [Render](https://render.com) for the backend because it is easy to configure with GitHub.

1. Create an account on Render and click **New > Web Service**.
2. Connect your GitHub repository (`SkillSync_Ai`).
3. Fill in the following settings:
   - **Name**: `skillsync-backend` (or any name you prefer)
   - **Root Directory**: `.` (leave empty or set to root)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Scroll down to **Environment Variables** and add the following keys from your local `.env`:
   - `PORT`: `5000` (Optional, Render provides one automatically)
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: Your super secret JWT key.
   - `FIREBASE_PROJECT_ID`: Find in Firebase Console > Project Settings.
   - `FIREBASE_CLIENT_EMAIL`: Your service account email.
   - `FIREBASE_PRIVATE_KEY`: Your service account private key (copy the entire string including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`).
   
   > [!WARNING]
   > Do **NOT** include `FIREBASE_SERVICE_ACCOUNT_PATH`. The backend is already configured to gracefully fallback to using `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` for authentication in production environments!

5. Click **Create Web Service**. Once deployed, copy your backend URL (e.g., `https://skillsync-backend.onrender.com`).

## 3. Deploy the Frontend (React on Vercel)

[Vercel](https://vercel.com) is the best platform for deploying Vite/React applications.

1. Create an account on Vercel and click **Add New... > Project**.
2. Import your `SkillSync_Ai` repository from GitHub.
3. Configure the project:
   - **Project Name**: `skillsync-frontend`
   - **Root Directory**: Click "Edit" and select `frontend`.
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand the **Environment Variables** section and add:
   - **Name**: `VITE_API_URL`
   - **Value**: `<YOUR_RENDER_BACKEND_URL>/api` (e.g., `https://skillsync-backend.onrender.com/api`)
5. Click **Deploy**. Vercel will build and launch your frontend.

## 4. Post-Deployment Checklist

- [ ] **Test Authentication**: Try signing up and logging in on the live Vercel URL to ensure Firebase and MongoDB are successfully connected.
- [ ] **Test File Uploads**: Try uploading a resume to ensure the `multer` and PDF processing work in your backend environment. 
- [ ] **CORS Configuration**: If you face Cross-Origin (CORS) errors in the browser console, ensure your `backend/server.js` has CORS configured to accept requests from your Vercel URL. You may need to update `app.use(cors({ origin: 'YOUR_VERCEL_URL' }))`.
