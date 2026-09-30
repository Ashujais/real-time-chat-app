# Real-Time Chat Application

A full-featured real-time chat application built with **React**, **Node.js**, **Express**, **Socket.io**, and **SQLite**. Users can send and receive messages instantly, see typing indicators, track online users, and retrieve message history after refreshing.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [How to Run](#how-to-run)
- [API Documentation](#api-documentation)
- [Socket.io Events](#socketio-events)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)
- [Bonus Features](#bonus-features-implemented)
- [Testing](#testing)
- [Screenshots / Demo](#screenshots--demo)
- [APK / Screen Recording](#apk--screen-recording)
- [Deployment](#deployment)
- [Submission Checklist](#submission-checklist)

---

## Project Overview

This application allows multiple users to chat in real time. It combines REST APIs for message persistence with Socket.io for instant real-time delivery. Messages are stored in a SQLite database, ensuring they persist across page refreshes and server restarts.

---

## Features

### Core Features

- ✅ **Real-time messaging** via Socket.io
- ✅ **Message persistence** with SQLite database
- ✅ **REST API** for sending and fetching messages
- ✅ **Username-based login** (no authentication required)
- ✅ **Chat history** preserved after refresh/reopen
- ✅ **Message timestamps** displayed on all messages
- ✅ **Own vs. other users' messages** clearly distinguished (right/left alignment, different colors)
- ✅ **Auto-scroll** to latest message (smart: doesn't force scroll when reading history)
- ✅ **Loading, error, and empty states** handled
- ✅ **Connection/disconnection handling** with visual indicators
- ✅ **Input validation** on both frontend and backend
- ✅ **Responsive design** for desktop and mobile
- ✅ **No duplicate messages** — clean architecture prevents double-rendering

### Bonus Features

- ✅ **Username-based login** with validation
- ✅ **Typing indicator** — "User is typing..." with animated dots
- ✅ **Online/offline status** — shows connected user count with expandable dropdown
- ✅ **Connection status indicator** — green/red dot with status text
- ❌ **Message delivered/read status** — not implemented to keep core reliable
- ❌ **Deployment** — project is deployment-ready (instructions below)

---

## Technology Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Frontend   | React 18 (TypeScript)             |
| Backend    | Node.js, Express 4                |
| Real-time  | Socket.io 4                       |
| Database   | SQLite (via better-sqlite3)       |
| Build Tool | Vite (React 18 + TypeScript)      |

---

## Architecture

### Message Flow (No Duplicate Messages)

```
┌──────────────┐                    ┌──────────────────┐
│   Frontend   │  POST /api/messages│     Express      │
│   (React)    │ ──────────────────>│     Backend      │
│              │                    │                  │
│              │                    │  1. Validate     │
│              │                    │  2. Persist to   │
│              │                    │     SQLite       │
│              │                    │  3. Emit via     │
│              │                    │     Socket.io    │
│              │                    └──────┬───────────┘
│              │                           │
│              │     'message:new' event   │ io.emit()
│              │ <─────────────────────────┤
│              │                           │
│  Add message │                    ┌──────┴───────────┐
│  to UI ONLY  │     'message:new'  │  Other Connected │
│  when socket │ ──────────────────>│     Clients      │
│  event fires │                    └──────────────────┘
└──────────────┘
```

**Key**: The sender does NOT add the message to the UI when the REST API responds. Instead, it waits for the `message:new` Socket.io event (which the server broadcasts to ALL clients, including the sender). This ensures every client receives messages through a single channel, preventing duplicates.

### Chat History Flow

```
┌──────────────┐  GET /api/messages ┌──────────────────┐
│   Frontend   │ ──────────────────>│     Express      │
│  (on mount)  │                    │     Backend      │
│              │ <──────────────────│                  │
│              │   [messages array] │  Query SQLite    │
└──────────────┘                    └──────────────────┘
```

---

## Project Structure

```
real-time-chat-app/
│
├── frontend/                      # React frontend
│   ├── public/
│   │   └── index.html            # HTML template
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── ChatHeader.tsx    # App header with user info & status
│   │   │   ├── ConnectionStatus.tsx  # Connected/disconnected indicator
│   │   │   ├── MessageBubble.tsx # Individual message display
│   │   │   ├── MessageInput.tsx  # Text input with send button
│   │   │   ├── MessageList.tsx   # Scrollable message container
│   │   │   ├── OnlineUsers.tsx   # Online user count & dropdown
│   │   │   ├── TypingIndicator.tsx # Typing animation
│   │   │   └── *.css             # Component styles
│   │   ├── screens/              # Page-level components
│   │   │   ├── LoginScreen.tsx   # Username entry screen
│   │   │   ├── ChatScreen.tsx    # Main chat interface
│   │   │   └── *.css             # Screen styles
│   │   ├── services/             # API & Socket clients
│   │   │   ├── api.ts            # REST API functions
│   │   │   └── socket.ts        # Socket.io client singleton
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useChat.ts       # Message state & operations
│   │   │   └── useSocket.ts     # Socket connection & events
│   │   ├── types/                # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── utils/                # Utility functions
│   │   │   └── formatTime.ts    # Timestamp formatting
│   │   ├── App.tsx              # Root component
│   │   ├── App.css
│   │   ├── index.tsx            # Entry point
│   │   └── index.css            # Global styles
│   ├── index.html            # HTML template with module entry
│   ├── vite.config.ts        # Vite configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── backend/                       # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   │   └── index.js          # Environment configuration
│   │   ├── controllers/
│   │   │   └── messageController.js  # Request handlers
│   │   ├── middleware/
│   │   │   ├── errorHandler.js   # Global error handling
│   │   │   └── validation.js    # Request validation
│   │   ├── models/
│   │   │   └── database.js      # SQLite setup & initialization
│   │   ├── routes/
│   │   │   └── messageRoutes.js # API route definitions
│   │   ├── services/
│   │   │   └── messageService.js # Database operations
│   │   ├── sockets/
│   │   │   └── socketHandler.js # Socket.io event handlers
│   │   └── utils/
│   │       └── helpers.js       # UUID & timestamp utilities
│   ├── app.js                    # Express configuration
│   ├── server.js                 # HTTP + Socket.io server
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## Prerequisites

- **Node.js** v16+ (tested with v20.18.0)
- **npm** v8+ (comes with Node.js)
- A modern web browser (Chrome, Firefox, Edge, Safari)

> **Note:** No database installation is required. SQLite is embedded via the `better-sqlite3` npm package — the database file is created automatically on first run.

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd real-time-chat-app
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Set up environment variables

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend (optional — defaults work out of the box)
cp frontend/.env.example frontend/.env
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable    | Default                   | Description                        |
| ----------- | ------------------------- | ---------------------------------- |
| `PORT`      | `5000`                    | Port the server listens on         |
| `CLIENT_URL`| `http://localhost:3000`   | Frontend URL (for CORS)            |
| `DB_PATH`   | `./data/chat.db`          | Path to the SQLite database file   |
| `NODE_ENV`  | `development`             | Environment mode                   |

### Frontend (`frontend/.env`)

| Variable               | Default                   | Description                        |
| ---------------------- | ------------------------- | ---------------------------------- |
| `VITE_API_URL`         | `http://localhost:5000`   | Backend REST API base URL          |
| `VITE_SOCKET_URL`      | `http://localhost:5000`   | Socket.io server URL               |

---

## How to Run

### Start the Backend

```bash
cd backend
npm start
```

The server will start on `http://localhost:5000`.

For development with auto-restart:

```bash
npm run dev
```

### Start the Frontend

In a **separate terminal**:

```bash
cd frontend
npm start
```

The app will open at `http://localhost:3000`.

### Test with Multiple Users

1. Open `http://localhost:3000` in one browser tab → enter a username (e.g., "Ashutosh")
2. Open `http://localhost:3000` in another tab or browser → enter a different username (e.g., "Test User")
3. Send messages from either tab and see them appear instantly in both

---

## API Documentation

### POST `/api/messages`

Send a new chat message.

**Request:**

```json
{
  "username": "Ashutosh",
  "message": "Hello, world!"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "Ashutosh",
    "message": "Hello, world!",
    "createdAt": "2026-09-30T12:30:00.000Z"
  }
}
```

**Validation Error (400):**

```json
{
  "success": false,
  "error": "Username is required and must be a string"
}
```

**Server Error (500):**

```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Validation Rules:**

- `username`: Required, string, 1–50 characters, whitespace trimmed
- `message`: Required, string, 1–1000 characters, whitespace trimmed

---

### GET `/api/messages`

Fetch chat message history.

**Query Parameters:**

| Param    | Default | Max  | Description                      |
| -------- | ------- | ---- | -------------------------------- |
| `limit`  | 50      | 200  | Number of messages to return     |
| `offset` | 0       | —    | Number of messages to skip       |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "Ashutosh",
      "message": "Hello, world!",
      "createdAt": "2026-09-30T12:30:00.000Z"
    }
  ],
  "total": 1
}
```

Messages are returned in chronological order (oldest first).

---

## Socket.io Events

### Client → Server

| Event             | Payload                    | Description                           |
| ----------------- | -------------------------- | ------------------------------------- |
| `user:join`       | `{ username: string }`     | Register user after connecting        |
| `user:typing`     | `{ username: string }`     | Notify others user is typing          |
| `user:stop-typing`| `{ username: string }`     | Notify others user stopped typing     |

### Server → Client

| Event              | Payload                                           | Description                          |
| ------------------ | ------------------------------------------------- | ------------------------------------ |
| `message:new`      | `{ id, username, message, createdAt }`            | New message broadcast to all clients |
| `user:online`      | `{ username: string, onlineUsers: string[] }`     | User connected                       |
| `user:offline`     | `{ username: string, onlineUsers: string[] }`     | User disconnected                    |
| `user:typing`      | `{ username: string }`                            | Another user is typing               |
| `user:stop-typing` | `{ username: string }`                            | Another user stopped typing          |

---

## Design Decisions

### Why React Web (instead of React Native)?

React web was chosen because:
- The development environment (Windows) has better tooling support for React web
- No need for Android Studio/JDK/emulator setup
- The application can be tested directly in a browser
- Responsive design makes it work well on mobile browsers too

### Why SQLite?

- **Zero setup** — no external database server required
- **Maximum portability** — works on any OS without installation
- **Embedded** — the `better-sqlite3` package includes everything needed
- **Sufficient for this use case** — single-process read/write works well for chat

### How Real-time Messaging Works

1. User types a message and clicks Send
2. Frontend calls `POST /api/messages` REST endpoint
3. Backend validates the message, persists it to SQLite, generates a UUID
4. Backend broadcasts `message:new` via Socket.io to ALL connected clients (including sender)
5. ALL clients receive the message via Socket.io and add it to their message list

### How Duplicate Messages Are Prevented

- The sender does NOT add the message to state when the REST API responds
- Messages are ONLY added to the UI when received via the `message:new` Socket.io event
- Additionally, the `useChat` hook has a deduplication check (by message ID) as a safety net
- This single-channel approach ensures every client gets messages from one source

### How Errors Are Handled

**Backend:**
- All routes wrapped in try/catch blocks
- Global error handler middleware catches unhandled errors
- Validation middleware rejects invalid requests with 400 status
- 404 handler for unknown routes
- Database errors logged but stack traces hidden in production

**Frontend:**
- API errors shown as error messages near the relevant UI element
- Socket disconnection displayed in the header status indicator
- Failed message sends show error near the input field
- Loading spinner while fetching chat history
- Empty state message when no messages exist
- Retry button when history load fails

---

## Assumptions

1. This is a single chat room — all users see the same messages
2. Usernames are not unique — multiple users can use the same name
3. No authentication is required — any username is accepted
4. Messages are stored indefinitely (no cleanup/TTL)
5. The SQLite database is suitable for the expected message volume
6. The application runs on a single server (not horizontally scaled)

---

## Bonus Features Implemented

| Feature               | Status | Details                                           |
| --------------------- | ------ | ------------------------------------------------- |
| Username-based login  | ✅     | Clean login screen with validation                |
| Typing indicator      | ✅     | "User is typing..." with animated dots            |
| Online/offline status | ✅     | Badge with count + expandable dropdown            |
| Connection status     | ✅     | Green/red dot in header                           |
| Message delivered/read| ❌     | Not implemented (would add complexity)            |
| Deployment            | ❌     | Deployment-ready, instructions provided below     |

---

## Testing

### Manual Test Scenarios

| # | Test                                      | Steps                                                                                     |
|---|-------------------------------------------|-------------------------------------------------------------------------------------------|
| 1 | Backend starts                           | Run `npm start` in backend directory                                                      |
| 2 | Frontend starts                          | Run `npm start` in frontend directory                                                     |
| 3 | Two clients open                         | Open `localhost:3000` in two browser tabs                                                 |
| 4 | User A sends message                     | Type and send in Tab 1 → verify it appears in Tab 2 instantly                             |
| 5 | User B responds                          | Type and send in Tab 2 → verify it appears in Tab 1 instantly                             |
| 6 | Refresh preserves history                | Refresh Tab 1 → verify all previous messages are still displayed                          |
| 7 | Timestamps visible                       | Check that every message shows a formatted time                                           |
| 8 | Disconnect handling                      | Close Tab 2 → verify Tab 1 shows updated online count                                    |
| 9 | Reconnect handling                       | Reopen Tab 2 → verify connection restores and chat works                                  |
| 10| Empty message validation                 | Try sending empty or whitespace-only message → should be blocked                          |
| 11| Invalid username validation              | Try entering empty username → error shown                                                 |
| 12| No duplicate messages                    | Send several messages → verify each appears exactly once                                  |
| 13| Database persistence                     | Restart backend → messages still returned by GET /api/messages                            |
| 14| REST API responses                       | Use curl/Postman to test endpoints directly                                               |
| 15| Typing indicator                         | Start typing in Tab 1 → "is typing..." appears in Tab 2                                  |

### Testing REST APIs with curl

```bash
# Fetch all messages
curl http://localhost:5000/api/messages

# Send a message
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"username": "TestUser", "message": "Hello!"}'

# Test validation (empty message)
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"username": "TestUser", "message": ""}'

# Test 404
curl http://localhost:5000/api/nonexistent
```

---

## Screenshots / Demo

> Add screenshots or screen recordings here after running the application.

**Recommended screenshots:**

1. Login screen
2. Chat interface with messages
3. Two users chatting (side by side)
4. Typing indicator in action
5. Online users dropdown
6. Mobile responsive view

---

## APK / Screen Recording

### Android APK (Successfully Generated)

An Android APK has been compiled and is ready for installation or submission:

- **Location**: `apk/RealTimeChat.apk` (also at `frontend/android/app/build/outputs/apk/debug/app-debug.apk`)
- **Package Name**: `com.vedaz.realtimechat`
- **File Size**: ~4.1 MB (`4,115,456` bytes)
- **Target Platform**: Android 7.0 (API 24) to Android 15 (API 35)
- **Features**: Native Android WebView container with full Socket.io and REST communication enabled, cleartext local traffic permitted for dev servers.

To rebuild the APK at any time:
```bash
cd frontend
npm run build
npx cap sync android
cd android
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
.\gradlew.bat assembleDebug
```

### Screen Recording Instructions

To create a screen recording for submission:

1. Start the backend: `cd backend && npm start`
2. Start the frontend: `cd frontend && npm start`
3. Open a screen recorder (e.g., OBS, Windows Game Bar `Win+G`, or browser extensions)
4. Record the following sequence:
   - Launch the app at `http://localhost:3000`
   - Enter a username (e.g., "Ashutosh") and click "Join Chat"
   - Show the empty chat screen
   - Open a second browser tab at `http://localhost:3000`
   - Enter a different username (e.g., "Test User")
   - Send a message from User A → show it appear instantly for User B
   - Reply from User B → show it appear instantly for User A
   - Show timestamps on messages
   - Demonstrate typing indicator (start typing in one tab, see indicator in other)
   - Show online user count and dropdown
   - Refresh one tab → show previous messages are preserved
   - Close one tab → show online count decreases
5. Save the recording as `.mp4` or `.webm`

---

## Deployment

This project is **deployment-ready** but has not been deployed. To deploy:

### Backend (Render / Railway)

1. Create an account on [Render](https://render.com) or [Railway](https://railway.app)
2. Create a new **Web Service**
3. Connect your GitHub repository
4. Set the root directory to `backend`
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Set environment variables:
   - `PORT` — provided by the platform
   - `CLIENT_URL` — your deployed frontend URL
   - `DB_PATH` — `./data/chat.db`
   - `NODE_ENV` — `production`
8. Deploy

### Frontend (Vercel / Netlify)

1. Create an account on [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Set the root directory to `frontend`
4. Set build command: `npm run build`
5. Set publish directory: `build`
6. Set environment variables:
   - `REACT_APP_API_URL` — your deployed backend URL
   - `REACT_APP_SOCKET_URL` — your deployed backend URL
7. Deploy

> **Important:** After deploying the backend, update `CLIENT_URL` to match the frontend domain for proper CORS configuration.
