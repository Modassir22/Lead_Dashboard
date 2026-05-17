# Lead Management Dashboard

A simple and powerful Lead Management Dashboard built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript. It includes JWT authentication, Lottie animations, and a responsive UI using Tailwind CSS.

## Getting Started

Follow these easy steps to get the project running on your local machine.

### 1. Setup the Backend
Open a terminal and go into the backend folder:
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder (you can just copy the `.env.example` file and rename it). It should look like this:
```env
PORT=8080
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
```
*(Make sure to replace the dummy values with your actual MongoDB URI and a random secret string for the JWT).*

Now, start the backend server:
```bash
npm run dev
```

### 2. Setup the Frontend
Open a new terminal window and go to the frontend folder:
```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder (or copy `.env.example`):
```env
VITE_API=http://localhost:8080/api
```

Start the frontend app:
```bash
npm run dev
```

### 3. You're all set!
Just open `http://localhost:5173` in your browser. 
You can register a new admin account right from the login page and start managing your leads.

---

### Features
- **JWT Auth & Role Based Access:** Secure login/register flow. Only admins can delete leads.
- **Beautiful UI:** Tailored with Tailwind CSS and Lottie animations for loading states.
- **Strict TypeScript:** Strongly typed codebase to prevent runtime errors.
- **Search & Filters:** Easily find leads by name/email or filter by source/status.
- **Export Data:** Download your leads as a CSV file in one click.

---

## Deployment Guide

### 🚀 Deploying Frontend on Vercel
1. Login to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. In the project configuration:
   - Set **Root Directory** to `frontend`.
   - Framework Preset should auto-detect as **Vite**.
4. Open the **Environment Variables** section and add:
   - `VITE_API` = `<your-railway-backend-url>/api` (e.g., `https://your-backend.up.railway.app/api`)
5. Click **Deploy**. *(Note: A `vercel.json` is already included to fix page refresh issues in React Router).*

### 🚂 Deploying Backend on Railway
1. Login to [Railway](https://railway.app) and click **New Project** -> **Deploy from GitHub repo**.
2. Select your repository.
3. Once the project is created, go to the Service **Settings**.
4. Under **Build**, change the **Root Directory** from `/` to `/backend`.
5. Under **Variables**, add your production secrets:
   - `MONGO_URI` = `your_mongodb_atlas_url`
   - `JWT_SECRET` = `any_secure_random_string`
   - `PORT` = `8080`
6. Railway will automatically install dependencies and run `npm start` to launch your backend!
