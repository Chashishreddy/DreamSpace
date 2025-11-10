 codex/implement-ai-interior-design-visualizer-vm00yo
# DreamSpace – Secure AI Interior Design Visualizer

DreamSpace turns real room photos into redesigned interiors using image-to-image AI. This version ships with a secure Node.js backend that protects your Stability API key, enforces rate limiting, and logs activity for auditing.

## Project Structure

```
dreamspace/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── controllers/
│   │   └── redesignController.js
│   ├── middleware/
│   │   ├── authentication.js
│   │   ├── errorHandler.js
│   │   ├── requestLogger.js
│   │   └── uploadMiddleware.js
│   ├── routes/
│   │   └── redesign.js
│   ├── utils/
│   │   └── time.js
│   ├── logs/
│   │   └── .gitkeep
│   ├── package.json
│   └── server.js
├── .env.example
├── .gitignore
└── README.md
```

## Features

- **Modern responsive UI** with drag-and-drop uploads and before/after slider.
- **Secure backend API** that hides the Stability API key from browsers.
- **Content Security Policy** and hardened headers via Helmet.
- **Rate limiting** to mitigate abuse (configurable via env vars).
- **Optional JWT authentication** with role-based permission scaffolding.
- **Audit logging** to JSON lines stored in `backend/logs/audit.log`.
- **Image validation & sanitation** (file type, size limit, EXIF stripping with Sharp).

## Prerequisites

- Node.js 18 or newer (for native `fetch`, `FormData`, and `Blob`).
- Stability AI account with Image-to-Image API access.

## Setup

1. **Clone & install backend dependencies**
   ```bash
   git clone <your-fork-url>
   cd DreamSpace/backend
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp ../.env.example ../.env
   ```
   Edit `.env` with the following values:
   - `STABILITY_API_KEY`: Your Stability key (server-side only).
   - `PORT`: Port for the backend (default 5000).
   - `AUTH_MODE`: Set to `jwt` to require bearer tokens, otherwise `none`.
   - `JWT_SECRET`: Secret used to validate JWT tokens when `AUTH_MODE=jwt`.
   - `RATE_LIMIT_*`: Window and max request settings.
   - `MAX_UPLOAD_BYTES`: Maximum allowed upload size (default 5 MB).

3. **Run the backend**
   ```bash
   cd backend
   npm run start
   ```
   The API hosts the static frontend automatically. Navigate to `http://localhost:5000` to use DreamSpace locally.

## Frontend Development Tips

- The frontend is a static bundle (HTML/CSS/JS). Adjust files in `frontend/`.
- When running the backend locally, the UI is served from the same origin; no CORS tweaks are needed.
- To point the UI at a remote backend (e.g., backend on Render, frontend on GitHub Pages), either:
  - Set `window.DREAMSPACE_API_BASE_URL = 'https://your-backend.example.com';` before loading `app.js`, or
  - Update the `<meta name="dreamspace-api-base-url" content="https://your-backend.example.com" />` tag in `frontend/index.html`.

## Deployment

### Frontend
- **GitHub Pages / Vercel / Netlify**: Deploy the `frontend/` directory. Ensure the production build points API calls at your backend URL.

### Backend
- **Render / Railway / Fly.io / Replit**: Deploy the `backend/` folder as a Node service.
  - Set environment variables in the provider’s dashboard (`STABILITY_API_KEY`, etc.).
  - Configure the start command as `node server.js`.
  - Expose the port defined by the platform (often provided via `PORT` env var).

### Security Hardening Checklist
- Rotate your Stability API key regularly and restrict service usage in your Stability dashboard.
- Enable `AUTH_MODE=jwt` if you want to gate access behind signed tokens.
- Use HTTPS end-to-end (enforced by your hosting provider or a reverse proxy like Cloudflare).
- Monitor `backend/logs/audit.log` or ship logs to a SIEM for anomaly detection.

## API Reference

`POST /api/redesign`
- **Body**: `multipart/form-data`
  - `image` (binary) – JPG/PNG up to 5 MB.
  - `style` (string) – Style name.
  - `prompt` (string) – Full prompt text for the diffusion model.
- **Response**: `image/png` blob containing the redesigned room.
- **Errors**: JSON with `message` field describing validation or processing issues.

## Live Demo

- Backend: _Deploy to Render/Railway and update this link_.
- Frontend: _Publish to GitHub Pages/Vercel and add the URL here_.

## Logging & Auditing

- Each request writes a JSON log line to `backend/logs/audit.log` with timestamp, actor, role, and latency.
- Logs are excluded from git via `.gitignore`; export or rotate as needed in production.

## Contributing

Pull requests are welcome! Please lint your code, follow the existing structure, and avoid committing secrets.

## 🚀 Live Demo
https://chashishreddy.github.io/DreamSpace/

---
# DreamSpace – AI Interior Design Visualizer

DreamSpace redesigns real room photos using AI-powered image-to-image interior styling.

## Features
- Securely store your Stability API key in your browser using local storage.
- Upload any room photo via drag-and-drop or file picker.
- Choose from curated interior design prompts (Minimalist, Cozy Scandinavian, Japandi, Luxury Modern, Cyberpunk Neon, Warm Boho).
- Compare original and redesigned images with an interactive before/after slider.
- Download the generated redesign with a single click.

## Getting Started
1. Open `index.html` directly in your browser (double-click the file or use `file://` path).
2. Paste your [Stability API Key](https://platform.stability.ai/account/keys).
3. Upload a photo of your room.
4. Select an interior style.
5. Click **Redesign Room**.
6. Drag the slider to compare the before and after.
7. Click **Download** to save the redesigned image.

> **Note:** Image generation happens via Stability AI's hosted API, so an internet connection and available API credits are required.

## Project Structure
```
index.html   # Application markup and layout
styles.css   # Frosted-glass inspired UI styling
script.js    # Client-side logic for API calls and interactions
```

No additional build steps are needed—everything runs directly in your browser.
main
