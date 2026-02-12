# Project Changes and Run Guide

This document summarizes the fixes and features added, plus how to run the project locally.

## Summary of Changes

- Refactored the Judge Dashboard to show all case statuses in tabs with vote/comment counts.
- Redesigned the Judge AI Assistant into a professional "AI Desk" panel with case snapshot and chat controls.
- Added judge request action in the community dashboard (open modal + submit reason).
- Updated login/register layouts into spacious, two-panel cards with stronger form emphasis.
- Improved role messaging so judge signups are members until approved by admin.
- Fixed home scene overlay markup and added a close button for the community message.
- Removed overly broad global text overrides that interfered with Google button visibility.
- Replaced OpenAI integration with Google Gemini (new aiService + GEMINI_API_KEY).
- Updated Case Detail UI to match dark mode theme.
- Standardized API base URL handling for manual `VITE_API_BASE_URL`.
- Added full Social Circle module (friends, posts, chat, notifications, blocked users) with new backend models and Social Circle UI.
- Fixed analytics calculations to match the current schema (filedBy, statuses, votes/comments).
- Fixed user dashboard stats (votes, resolved cases, win rate) and added commentCount and community stats.
- Added a judge/admin users list endpoint for verification workflow.
- Unified password reset flows to use the auth controller (DB-backed tokens).
- Enforced comment rules consistently (comments only on published cases).
- Added Socket.IO broadcast events on case create, vote, comment, status, and verdict updates.
- Added Socket.IO client wiring to auto-refresh affected pages.
- Added comment posting UI on case detail page.
- Added AI verdict request UI (judge/admin only).
- Added PDF download button on case detail (authenticated users).
- Made API base URL handling consistent between Axios instances.
- Re-enabled Google login buttons on Login and Register screens.
- Centralized profile image URL handling to avoid 404s when backend runs on non-default ports.
- Fixed PDF generation to avoid getStream.buffer runtime errors.
- Added COOP/COEP dev headers in Vite to prevent Google login popup issues.
- Improved Create Case form styling for better light/dark contrast.
- Added animated community scene to the home hero section.
- Removed duplicate header on the Home page to avoid double navigation.
- Applied unified form styling across Login/Register/Reset/Forgot/Profile/Verification/Case forms.
- Added navigation links (Features/How it Works/Community/Contact) to the global header with mobile menu.
- Added scene overlay text + CTA to integrate the community animation with the hero section.
- Google login buttons now adapt to dark mode for visibility.
- Added dismissible guest notice banner (sign in/sign up prompt) with close button.
- Improved socket connection handling to avoid duplicate connections.
- Added hover-lift/hover-glow interactions for cards and CTAs.

## Files Touched (High-Level)

- Backend: analytics, user dashboard, case controller, vote controller, user routes, server rate limiting.
- Frontend: dashboard, cases, case detail, auth context, socket setup.

## How To Run Locally

### 1) Set environment variables

Create `.env` in `backend/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_key
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
RESEND_API_KEY=your_resend_key
ADMIN_EMAIL=admin@dcccourt.com
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Create `.env` in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

If you don't have keys yet, leave them blank; features using them will degrade gracefully (AI verdicts, email, Google OAuth, Cloudinary).

### 2) Install dependencies

```bash
cd backend
npm install
```

```bash
cd ../frontend
npm install
```

### 3) Run the servers

```bash
cd backend
npm run dev
```

```bash
cd ../frontend
npm run dev
```

### 4) Open the app

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Notes and Behavior

- AI verdicts require `GEMINI_API_KEY`.
- Email notifications require `EMAIL_SERVICE` + credentials.
- Google OAuth requires `VITE_GOOGLE_CLIENT_ID`.
- PDF download is protected and requires login.
- Real-time updates are via Socket.IO and trigger query refreshes on relevant pages.
