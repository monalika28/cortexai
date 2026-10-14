# CortexAI — Multi-Agent AI Platform

CortexAI is a full-stack AI platform where every prompt is routed to a specialized AI agent. One chat interface can hold a normal conversation, generate code, create PDF and PPT files, generate images, search the web, answer questions from uploaded PDFs, and analyze images.

**Demo video:** [Watch the demo](https://www.loom.com/share/95b0b202e49c4301a02abe881559c87d)

## Features

- **Auto routing** – a LangGraph router picks the right agent for each prompt
- **Chat** – general conversation with memory
- **Coding agent** – generates multi-file projects with a live code preview panel
- **PDF generation** – creates downloadable PDF documents
- **PPT generation** – creates downloadable PowerPoint presentations
- **Image generation** – text-to-image
- **Vision** – analyzes uploaded images
- **PDF Q&A (RAG)** – answers questions from uploaded PDFs using embeddings and the Qdrant vector database
- **Web search** – real-time search with the Tavily API
- **Authentication** – Google sign-in with Firebase, verified on the server
- **Credits and usage tracking** – per-user credit limits stored in MongoDB

## Architecture

The backend is split into independent microservices behind an API gateway.

```
React (Vite) frontend
        |
   API Gateway  --- verifies Firebase token, proxies requests
   |      |      |
 Auth    Chat   Agent  (Billing service for credits and plans)
   |      |      |
        MongoDB Atlas      Redis      Qdrant      Cloudinary
```

| Service | Responsibility |
| --- | --- |
| Gateway | Single entry point, token verification, request proxying |
| Auth | Firebase login, user records |
| Chat | Conversations and messages |
| Agent | LangGraph router and all AI agents |
| Billing | Plans and credit configuration |

## Tech Stack

- **Frontend:** React, Redux, Vite
- **Backend:** Node.js, Express.js, microservices, API Gateway
- **AI:** LangGraph, LangChain, Groq, Gemini, OpenRouter, RAG
- **Databases and storage:** MongoDB Atlas, Redis, Qdrant (vector DB), Cloudinary (file storage)
- **Auth:** Firebase Authentication
- **Search:** Tavily API
- **File generation:** pdfkit, pptxgenjs
- **DevOps:** Docker, Docker Compose

## Run Locally

### Prerequisites

- Node.js 18+
- Docker Desktop (for Redis)
- Accounts and API keys for MongoDB Atlas, Firebase, Groq, Gemini, OpenRouter, Tavily, Qdrant and Cloudinary

### Steps

1. Clone the repo
   ```bash
   git clone https://github.com/monalika28/cortexai.git
   cd cortexai
   ```
2. Start Redis
   ```bash
   cd backend
   docker compose up
   ```
3. Create a `.env` file in `backend/gateway` and in each folder under `backend/services` (auth, chat, agent, billing) with your own keys, such as MongoDB URI, Firebase, LLM keys, Tavily, Qdrant and Cloudinary.
4. Add your Firebase Admin SDK key as `backend/services/auth/serviceAccountKey.json` (this file is git-ignored).
5. Install dependencies and start each service
   ```bash
   cd backend/gateway && npm install && npm run dev
   cd backend/services/auth && npm install && npm run dev
   cd backend/services/chat && npm install && npm run dev
   cd backend/services/agent && npm install && npm run dev
   cd backend/services/billing && npm install && npm run dev
   ```
6. Start the frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
7. Open `http://localhost:5173`

## Notes

- Generated PDF and PPT files are uploaded to Cloudinary and returned as links.
- Secrets are never committed. `.env` files and the Firebase key are listed in `.gitignore`.

## Author

**Monalika Machal** — [LinkedIn](https://www.linkedin.com/in/monalika-machal)
