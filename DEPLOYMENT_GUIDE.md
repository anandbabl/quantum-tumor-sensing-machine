# 🚀 Production Deployment Guide
## Quantum Tumor Sensing Machine — Full-Stack Deployment

**GitHub Target:** `https://github.com/anandbabl/quantum-tumor-sensing-machine.git`  
**Frontend Host:** Vercel (Next.js 16.4.4 App Router)  
**Backend Host:** Render, Railway, Fly.io, or Docker (FastAPI + EfficientNetB3 Keras Model)  

---

## 📑 Table of Contents
1. [Architecture & Topology](#1-architecture--topology)
2. [Git & GitHub Setup](#2-git--github-setup)
3. [Deploying Frontend to Vercel](#3-deploying-frontend-to-vercel)
4. [Deploying FastAPI Backend to Render / Railway](#4-deploying-fastapi-backend-to-render--railway)
5. [Model Handling & Git LFS](#5-model-handling--git-lfs)
6. [Production Environment Variables](#6-production-environment-variables)
7. [Post-Deployment Verification](#7-post-deployment-verification)

---

## 1. Architecture & Topology

```
┌─────────────────────────────────┐       HTTPS / JSON       ┌─────────────────────────────────┐
│         Vercel (Edge)           │ ───────────────────────> │     Render / Railway (Linux)    │
│  Next.js 16 + React 19 Frontend │                          │       FastAPI Backend Engine    │
│   • 3D Brain WebGL Intro        │ <─────────────────────── │   • EfficientNetB3 (96.24% ML)  │
│   • 10 Dashboard Sections       │       CORS Allowed       │   • Groq Llama-3.3 AI Search    │
│   • Zero Auth Direct Access     │                          │   • Grad-CAM Heatmap Generation │
└─────────────────────────────────┘                          └─────────────────────────────────┘
```

- **Frontend:** Completely decoupled and statically optimized on Vercel. Communicates with the backend using the single environment variable: `NEXT_PUBLIC_API_URL`.
- **Backend:** Python 3.12 container with TensorFlow/Keras, OpenCV, and Groq SDK.

---

## 2. Git & GitHub Setup

The repository is configured with:
- **Root `.gitignore`**: Strictly excludes all `.env` files, virtual environments, `node_modules`, local databases, and temporary patient scan uploads.
- **`.gitattributes`**: Configured with Git LFS to track `backend/models/brain_tumor_model.keras` (222 MB) without hitting GitHub's 100 MB limit.

### Push to GitHub Commands:
```bash
# 1. Ensure Git LFS is active
git lfs install

# 2. Stage all verified files
git add .

# 3. Commit
git commit -m "feat: complete Quantum Tumor Sensing Machine production platform"

# 4. Set remote & push to main
git remote add origin https://github.com/anandbabl/quantum-tumor-sensing-machine.git
git branch -M main
git push -u origin main
```

---

## 3. Deploying Frontend to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** ➜ **Project**.
3. Import your GitHub repository: `anandbabl/quantum-tumor-sensing-machine`.
4. In the Project Configuration screen:
   - **Framework Preset:** Next.js
   - **Root Directory:** Click `Edit` and select `frontend`.
   - **Build Command:** `npm run build` (Automatically runs `prebuild` to compile CSS).
   - **Output Directory:** `.next`
   - **Install Command:** `npm install --legacy-peer-deps`
5. **Environment Variables:**
   - Add:
     ```
     NEXT_PUBLIC_API_URL = https://your-backend-service.onrender.com
     ```
     *(Use your deployed backend URL from Step 4 below)*.
6. Click **Deploy**. Vercel will build and assign you a production URL (e.g., `https://quantum-tumor-sensing-machine.vercel.app`).

---

## 4. Deploying FastAPI Backend to Render / Railway

### Option A: Render (Recommended — Free/Low Cost)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** ➜ **Web Service**.
3. Connect your repository: `anandbabl/quantum-tumor-sensing-machine`.
4. Configure:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python run.py` (or `uvicorn app.main:app --host 0.0.0.0 --port $PORT`)
   - **Instance Type:** Standard (at least 1 GB RAM to load the EfficientNetB3 model).
5. **Environment Variables:**
   ```
   GROQ_API_KEY = your_groq_api_key_here
   GROQ_MODEL = llama-3.3-70b-versatile
   CORS_ORIGINS = https://quantum-tumor-sensing-machine.vercel.app,http://localhost:3000
   SECRET_KEY = your-production-secret-key-32-chars
   PORT = 8000
   ```
6. Click **Create Web Service**.

### Option B: Docker Container Deployment
The backend includes a production [`backend/Dockerfile`](file:///Users/anand/Downloads/project%20major%20quantum%20ana/backend/Dockerfile). You can deploy it to any Docker host (Railway, Fly.io, AWS ECS, GCP Cloud Run):
```bash
docker build -t quantum-tumor-backend backend/
docker run -p 8000:8000 -e GROQ_API_KEY="your_key" quantum-tumor-backend
```

---

## 5. Model Handling & Git LFS

The trained deep learning model is located at:
`backend/models/brain_tumor_model.keras` (221.78 MB).

Because GitHub rejects direct file uploads > 100 MB, Git LFS stores a pointer in Git and uploads the 222 MB binary to GitHub's Large File Storage.

> [!TIP]
> If your cloud host doesn't support Git LFS during build, you can also upload `brain_tumor_model.keras` as a **Release Asset** in GitHub Releases (up to 2 GB allowed), or host it on Hugging Face / S3. The model service automatically verifies the model at startup.

---

## 6. Production Environment Variables Summary

### Frontend (Set in Vercel Dashboard):
| Variable | Value Example | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://quantum-tumor-api.onrender.com` | Live backend URL |

### Backend (Set in Render / Railway / Docker):
| Variable | Value Example | Description |
|---|---|---|
| `GROQ_API_KEY` | `gsk_...` | Groq AI Cloud API Key |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Clinical Chatbot Model |
| `CORS_ORIGINS` | `https://*.vercel.app,http://localhost:3000` | Allowed frontend domains |
| `DATABASE_URL` | `sqlite:///quantum_tumor.db` | SQLite or PostgreSQL URL |
| `SECRET_KEY` | `secure-random-32-bytes-string` | JWT session signature |
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `8000` | Bind port |

---

## 7. Post-Deployment Verification

1. **Verify Backend Health:**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "project": "QUANTUM TUMOR SENSING MACHINE",
     "model_loaded": true,
     "model_backbone": "EfficientNetB3 (Transfer Learning)",
     "classes": ["Glioma Tumor", "Meningioma Tumor", "Pituitary Tumor"]
   }
   ```

2. **Verify Frontend:**
   - Open your Vercel URL in your browser.
   - Experience the 3D Brain Intro.
   - Upload an MRI scan from `sample_scans/` on the `/analyze` page.
   - Confirm instant inference classification, 96.24% confidence scores, and Grad-CAM explainability heatmaps load seamlessly!
