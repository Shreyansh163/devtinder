# Pairly — Backend

Express + Socket.IO API for **Pairly**, a swipe-based matchmaking platform with real-time chat.

> 📖 See the [main project README](https://github.com/Shreyansh163/pairly) for the full overview, screenshots, architecture, and deployment notes.

**Companion repo:** [`pairly-web`](https://github.com/Shreyansh163/pairly-web)

---

## Stack
Node.js, Express 5, MongoDB (Mongoose), Socket.IO, JWT auth in httpOnly cookies, bcrypt, cookie-parser, validator.

## Run locally

```bash
npm install
cp .env.example .env       # fill in values (see below)
npm run dev                # http://localhost:7777
```

## Environment variables (`.env`)

```
PORT=7777
DB_CONNECTION_STRING=mongodb://localhost:27017/pairly
JWT_SECRET=<your-secret>
```

Generate a strong `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## API overview

| Router       | Endpoints |
|--------------|-----------|
| `auth`       | `POST /signup`, `POST /login`, `POST /logout` |
| `profile`    | `GET /profile/view`, `PATCH /profile/edit`, `PATCH /profile/password` |
| `request`    | `POST /request/send/:status/:userId`, `POST /request/review/:status/:requestId` |
| `user`       | `GET /user/requests/received`, `GET /user/connections`, `GET /feed`, `GET /user/chats` |

Plus Socket.IO events for real-time chat — see the main README.

## Project structure

```
src/
├── app.js               # Express + Socket.IO bootstrap
├── config/database.js
├── middleware/auth.js   # JWT verification middleware
├── models/              # user, connectionRequest, chat
├── routes/              # auth, profile, request, user, chat
└── utils/
    ├── validator.js
    └── socket.js        # Socket.IO server + event handlers
```
