<div align="center">

  <img src="client/public/og-image.jpg" alt="Student Success Hub Banner" width="400px" style="border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />

  <h1>🎓 Student Success Hub</h1>
  
  <p><strong>The Ultimate Premium Workspace for University Students</strong></p>

  <p>
    <a href="https://student-guide-green.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-Vercel-success?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
    <a href="https://github.com/dipto-hello/Student-Guide"><img src="https://img.shields.io/badge/Status-Active-blue?style=for-the-badge&logo=github" alt="Status" /></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  </p>

</div>

---

## ✨ Overview

**Student Success Hub** is an all-in-one, highly polished web application designed to elevate student productivity. Built with a stunning **3D Glassmorphism** aesthetic, it provides powerful tools for CGPA tracking, study planning, exam prep, and real-time collaboration.

## 🚀 Key Features

*   **📊 CGPA & SGPA Calculator:** Track your current grades and predict future semesters with an interactive, animated interface.
*   **⏱️ Pomodoro Study Timer:** Stay focused with built-in study and break intervals.
*   **⌨️ Typing Speed Widget:** Test and improve your WPM (Words Per Minute) in real-time.
*   **👥 Real-Time Study Room:** Join a virtual study room (via Socket.io) to see who else is studying and chat with peers.
*   **👑 Powerful Admin Dashboard:** Exclusive admin panel to monitor platform analytics, broadcast messages to all users, and manage accounts.
*   **🔒 Secure Authentication:** Seamless and secure server-side Google OAuth 2.0 (authorization-code flow) with PKCE and httpOnly session cookies.
*   **📱 Fully Responsive:** Beautiful, premium UI that works flawlessly on desktop, tablet, and mobile.
*   **🌍 PWA Ready:** Installable as a Progressive Web App for offline access!

---

## 🛠️ Tech Stack

<div align="center">
  <table>
    <tr>
      <td align="center"><b>Frontend</b></td>
      <td align="center"><b>Backend</b></td>
      <td align="center"><b>Database & Deployment</b></td>
    </tr>
    <tr>
      <td>
        • React (Vite)<br>
        • Tailwind CSS<br>
        • Framer Motion (3D Animations)<br>
        • Zustand (State)<br>
        • Radix UI
      </td>
      <td>
        • Node.js<br>
        • Express.js<br>
        • Socket.io (Real-time)<br>
        • Drizzle ORM<br>
        • JSON Web Tokens (JWT)
      </td>
      <td>
        • SQLite<br>
        • Turso Edge DB<br>
        • Vercel (Frontend Hosting)<br>
        • Render (Backend Hosting)
      </td>
    </tr>
  </table>
</div>

---

## 💻 Local Setup (For Developers)

Want to run this project locally on your machine? Follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/dipto-hello/Student-Guide.git
cd Student-Guide
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add the following:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```
*(Both come from the same OAuth 2.0 Client in [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials). The client secret is server-only — never expose it to the frontend.)*

> **⚠️ Register your redirect URI:** The server-side OAuth flow redirects back to `/api/auth/google/callback`. In Google Cloud Console → Credentials, add **both** `http://localhost:3000/api/auth/google/callback` (local dev) and `https://<your-vercel-domain>/api/auth/google/callback` (production) as **Authorized redirect URIs**.

*(Note: JWT_SECRET, ADMIN_EMAIL, and CLIENT_URL are automatically handled via zero-config deployment settings in `server/config.ts`)*

### 4. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 👨‍💻 Developed By

**Dipto Sarker**

<p>
  <a href="https://github.com/dipto-hello"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>
</p>

*If you found this project helpful or visually inspiring, don't forget to give it a ⭐ on GitHub!*
