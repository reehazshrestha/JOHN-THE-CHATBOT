# 🎨 JOHN — Frontend

> A clean, minimal chat UI for the JOHN AI assistant — pure HTML, Tailwind CSS, and Vanilla JS. No build step required.

---

## ✨ Features

- ⚡ **Real-time streaming** — tokens render as they arrive via SSE
- ✍️ **Blinking cursor** — live typing indicator while the model responds
- 🎨 **Markdown support** — renders bold, lists, headers, and code blocks
- 🖌 **Syntax highlighting** — fenced code blocks with `highlight.js`
- 📋 **Copy button** — on every code block
- 📐 **Auto-resize input** — textarea grows with your message
- ↩️ **Enter to send** — `Shift+Enter` for newline
- 📜 **Auto-scroll** — chat stays pinned to the latest message

---

## 🛠 Tech Stack

| Purpose | Library |
|---------|---------|
| Styling | Tailwind CSS (CDN) |
| Icons | Font Awesome 7 |
| Markdown | marked.js |
| Highlighting | highlight.js (Atom One Dark) |
| HTTP | Fetch API + ReadableStream |

---

## 🚀 Usage

No install or build step needed. Just open `index.html` in a browser — or deploy to any static host.

### Point to your backend

In [script.js](script.js), update line 2:

```js
const API_URL = 'https://your-backend.onrender.com';
```

### Deploy options

| Platform | How |
|----------|-----|
| **GitHub Pages** | Push to repo → Settings → Pages |
| **Netlify** | Drag & drop the `frontend/` folder |
| **Vercel** | `vercel` CLI or import from GitHub |
| **Cloudflare Pages** | Connect repo, no build command needed |

---

## 📁 Structure

```
frontend/
├── index.html       # App shell + styles
└── script.js        # Chat logic, SSE streaming, markdown rendering
```

---

## 🔧 Configuration

| Variable | Location | Description |
|----------|----------|-------------|
| `API_URL` | `script.js:2` | Backend base URL |
