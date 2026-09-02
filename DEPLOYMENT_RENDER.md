# Anwar Clothing — Render Deployment Guide

This guide walks you through deploying **Anwar Clothing** to **Render**.

Render provides free tiers for:
- 🗄️ **PostgreSQL Database**
- ⚙️ **Node.js Web Service (Backend API)**
- 🌐 **Static Site (React Frontend)**

---

## Method 1: 🚀 Automated 1-Click Deployment (Recommended)

The repository includes a ready-to-use [`render.yaml`](file:///c:/Users/hp/Downloads/anwar-clothing/render.yaml) Blueprint file. Render reads this file and automatically creates the PostgreSQL database, backend service, frontend static site, and wires up all environment variables.

### Steps:
1. **Push your code to GitHub or GitLab**:
   ```bash
   git add .
   git commit -m "Configure Render deployment"
   git push origin main
   ```

2. **Open Render Dashboard**:
   - Go to [dashboard.render.com](https://dashboard.render.com/) and sign in.

3. **Deploy via Blueprint**:
   - Click **New +** in the top right corner and select **Blueprint**.
   - Connect your GitHub / GitLab account and select your repository (`anwar-clothing` / `Libas-Mehar`).
   - Give your Blueprint instance a name (e.g. `libas-mehar-stack`).
   - Render will parse `render.yaml` and list 3 resources to be created:
     - `libas-mehar-db` (PostgreSQL Database)
     - `libas-mehar-backend` (Node.js API)
     - `libas-mehar-frontend` (React Frontend)
   - Click **Apply**.

4. **Wait for deployment**:
   - Render will provision the database, build the backend, run `prisma generate` and `prisma db push` automatically, and publish the frontend to CDN.

---

## Method 2: 🛠️ Manual Deployment via Render Dashboard

If you prefer configuring resources manually in the Render dashboard:

### Step 1: Create PostgreSQL Database
1. Go to Render Dashboard -> **New +** -> **PostgreSQL**.
2. Name: `libas-mehar-db`
3. Database Name: `anwar_clothing`
4. User: `anwar_user`
5. Select **Free** plan.
6. Click **Create Database**.
7. Once created, copy the **Internal Database URL** (e.g. `postgres://anwar_user:xxx@dpg-xxx-a:5432/anwar_clothing`).

### Step 2: Create Backend Web Service
1. Go to Render Dashboard -> **New +** -> **Web Service**.
2. Connect your repository and select the `main` branch.
3. Configure the service:
   - **Name**: `libas-mehar-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Expand **Environment Variables** and add:
   | Key | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |
   | `DATABASE_URL` | *(Paste Internal Database URL from Step 1)* |
   | `JWT_SECRET` | *(Click "Generate" or paste random 32+ character string)* |
   | `JWT_REFRESH_SECRET` | *(Click "Generate" or paste random 32+ character string)* |
   | `CLIENT_URL` | `https://libas-mehar-frontend.onrender.com` *(Replace with your frontend URL)* |
5. Click **Create Web Service**.

### Step 3: Create Frontend Static Site
1. Go to Render Dashboard -> **New +** -> **Static Site**.
2. Connect your repository and select the `main` branch.
3. Configure the site:
   - **Name**: `libas-mehar-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Expand **Environment Variables** and add:
   | Key | Value |
   | --- | --- |
   | `VITE_API_URL` | `https://libas-mehar-backend.onrender.com/api` *(Replace with your backend URL + `/api`)* |
5. Under **Redirects/Rewrites**, add a rewrite rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**.

---

## 🌾 Step 4: Seed Initial Products & Disciplines

Once your backend is running on Render:
1. Open your **`libas-mehar-backend`** service on Render Dashboard.
2. Click on **Shell** in the left sidebar menu.
3. In the terminal, run:
   ```bash
   node prisma/seed.js
   ```
4. You will see output confirming initial disciplines (Fabric, Fragrance, Leather, Gift Box), collections, and sample products seeded into the database!

---

## 🔍 Verification & Health Check

1. Visit your backend API health endpoint:
   `https://libas-mehar-backend.onrender.com/api/health`
   Expected response: `{"status":"ok"}`

2. Visit your frontend site:
   `https://libas-mehar-frontend.onrender.com`
   - Browse catalog & gift box composer
   - Create an account & test Cash on Delivery checkout.
