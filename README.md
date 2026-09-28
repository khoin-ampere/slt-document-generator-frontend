# SLT Docs Generator Frontend

React/Vite frontend for SLT Docs Generator. Users sign in with their SLT account, create documentation jobs, review generated guides and evidence screenshots, approve requested SLT operations, and publish approved guides to Confluence.

## Requirements

- Node.js 18+
- A running SLT Docs Generator backend

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` to the backend base URL. For example, use `http://localhost:8000` locally or the deployed backend URL. Do not commit `.env`.

## Commands

```bash
npm run dev
npm run build
npm run preview
```
