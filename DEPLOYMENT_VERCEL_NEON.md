# Deployment Setup for https://libas-mehar.vercel.app

This document has your exact environment variables pre-configured for your frontend deployed at:
👉 **https://libas-mehar.vercel.app**

---

## 1. ⚙️ Render Backend Environment Variables

When setting up your backend Web Service on **Render** (`libas-mehar-backend`), copy and paste these exact key-value pairs:

| Environment Variable Key | Exact Value to Enter |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | *(Paste your connection string from Neon.tech)* |
| `CLIENT_URL` | `https://libas-mehar.vercel.app` |
| `JWT_SECRET` | *(Click "Generate" on Render or enter any random string)* |
| `JWT_REFRESH_SECRET` | *(Click "Generate" on Render or enter any random string)* |

**Build & Start Commands on Render**:
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

---

## 2. ⚡ Vercel Frontend Environment Variables

On **Vercel** (`libas-mehar.vercel.app`), go to **Settings** $\rightarrow$ **Environment Variables** and add:

| Environment Variable Key | Value to Enter |
| :--- | :--- |
| `VITE_API_URL` | `https://<your-render-backend-name>.onrender.com/api` |

*(Replace `<your-render-backend-name>` with your actual Render service name)*

---

## 3. 🌾 Seed Data into Neon PostgreSQL

After your backend service is deployed on Render:
1. Open Render Dashboard $\rightarrow$ **libas-mehar-backend** $\rightarrow$ **Shell**.
2. Run:
   ```bash
   node prisma/seed.js
   ```
3. Your database on Neon will now have all sample clothing, fabric, fragrance, leather items, and collections!
