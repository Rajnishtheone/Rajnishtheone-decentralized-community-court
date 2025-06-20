# dcc-court

# ⚖️ Decentralized Community Court (DCC)

A powerful MERN-based platform where communities can collaboratively vote, discuss, and receive AI-assisted verdicts on ethical or legal cases — all in real-time and fully transparent.

---

## 🚀 Features & Functionalities

| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| 👤 **User Roles**       | Register/Login with roles: `Admin`, `Judge`, `Public`                     |
| 📂 **Case Management** | Create, edit, delete, and view legal/ethical cases                         |
| 🗳️ **Voting System**    | Vote on cases with real-time updates using Socket.IO                      |
| 💬 **Comment System**   | Add public or judge-only comments to each case                            |
| 🧠 **AI Verdicts**      | Get intelligent verdict suggestions via OpenAI or Gemini API               |
| 🔍 **Smart Search**     | ElasticSearch integration to search cases by tags, names, or keywords     |
| 🖼️ **Evidence Upload**  | Upload and attach media (images/videos) via Cloudinary                    |
| 🔐 **JWT Auth**         | Secure login with access & refresh token-based authentication             |
| 🎨 **UI/UX**            | Tailwind-powered responsive interface with Dark/Light mode toggle         |
| 🐳 **Dockerized Setup** | Containerized backend, frontend, Mongo, Redis, and ElasticSearch          |
| 🧪 **Testing & CI/CD**  | Basic unit testing + GitHub Actions for CI pipelines                      |

---

## 🧰 Tech Stack

### 🖥️ Frontend
- React.js ⚛️
- Tailwind CSS 🎨
- Apollo Client 🚀
- Socket.IO 🔌

### 🛠️ Backend
- Node.js + Express ⚙️
- MongoDB with Mongoose 🍃
- Redis for session caching ⚡
- GraphQL (Apollo Server) 🔍

### 🤖 AI & Search
- OpenAI / Gemini API 🧠
- ElasticSearch 🔎

### 🔒 Auth
- JWT + Refresh Tokens 🔐
- Role-Based Access Control 🛡️

### ☁️ DevOps & Storage
- Docker 🐳
- Cloudinary 📷
- GitHub Actions 🤖

---

## 🗂️ Project Folder Structure
📦 dcc-court
├── 📁 backend
│   ├── 📁 src
│   │   ├── 📁 controllers → All logic for auth, user, case, comment, vote
│   │   ├── 📁 middlewares → Auth, role-checking, and error handlers
│   │   ├── 📁 models → Mongoose schemas (User, Case, Vote, etc.)
│   │   ├── 📁 routes → Route declarations for all modules
│   │   ├── 📁 graphql → (To be added) Resolvers and schema definitions
│   │   ├── 📁 sockets → Real-time Socket.IO logic
│   │   └── server.js → Entry point for backend
│   ├── .env → Environment variables
│   └── package.json → Backend dependencies
│
├── 📁 frontend → (To be created next)
│   └── ... → React + Tailwind + Apollo Client frontend
│
├── 📄 README.md → This file
└── 🐳 docker-compose.yml → Docker orchestration file


