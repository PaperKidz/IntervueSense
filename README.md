# 🚀 VirtueSense: AI-Powered Interview Practice Platform

VirtueSense is an intelligent interview simulation platform that analyzes **facial expressions**, **voice tone**, and **speech clarity** to help users improve communication skills and confidence in interviews.  
It combines **Flask**, **Node.js**, **React + Vite**, **OpenAI**, and **DeepFace** — all containerized using **Docker** for easy setup and deployment.

---

## 🧠 Features

* 🎤 Real-time **speech-to-text** analysis using SpeechRecognition and OpenAI  
* 😊 **Emotion & facial expression** detection with DeepFace and OpenCV  
* 🧩 Unified **Flask + Node.js + React** microservice architecture via Docker  
* 🔊 Supports **audio-based** and **text-based** feedback  
* 📊 Provides structured insights into clarity, tone, and confidence  
* 🐳 **Dockerized** for instant environment setup with one command  

---

## 📦 Prerequisites

Before you begin, make sure you have the following installed:

| Dependency | Minimum Version | Purpose |
| ----------- | ---------------- | -------- |
| **Docker** | Latest | Containerization of all services |
| **Git** | — | Clone repository |

---

## 🛠️ Step 1: Clone Repository

```bash
git clone https://github.com/PaperKidz/IntervueSense.git
cd IntervueSense
```

---

## ⚙️ Step 2: Environment Configuration

Create `.env` files for each service using the provided examples:

```bash
# From project root
cp Backend/.env.example Backend/.env
cp backend-nodejs/.env.example backend-nodejs/.env
cp Frontend/.env.example Frontend/.env
```

Then open each `.env` file and fill in your credentials.  
For example, in **Backend/.env**:

```env
OPENAI_API_KEY=sk-your-secret-key
```

Make sure all `.env` files contain correct paths, ports, and API keys.

---

## 🐳 Step 3: Build & Run with Docker

Run the following command from the project root:

```bash
docker-compose up --build
```

Docker will automatically:

1. Build images for Flask, Node.js, and React (Vite)
2. Set up network and environment variables
3. Start Nginx as a reverse proxy routing between frontend and backend containers

Once the build completes, open your browser:

```text
http://localhost
```

---

## ⚡ Project Structure

```
VirtueSense/
│
├── Backend/                # Flask backend (Python)
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│
├── backend-nodejs/         # Node.js microservice backend
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│
├── Frontend/               # React + Vite frontend
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│
├── nginx/
│   └── nginx.conf          # Reverse proxy configuration
│
├── docker-compose.yml
└── README.md
```

---

## 🌍 Default Service URLs

| Service | URL | Description |
|----------|-----|-------------|
| **Frontend (React)** | `http://localhost` | Main user interface |
| **Flask Backend** | `http://localhost:5000` | AI & DeepFace analysis |
| **Node.js Backend** | `http://localhost:4000` | Evaluation, progress APIs |
| **Nginx** | `http://localhost` | Reverse proxy to all services |

---

## 🔌 API Endpoints (Flask Backend)

| Endpoint | Method | Description |
| --------- | ------ | ----------- |
| `/api/analyze_face` | POST | Analyze facial emotion from base64 or uploaded image |
| `/api/analyze_audio` | POST | Process audio input for tone & emotion |
| `/api/transcribe` | POST | Convert user audio speech to text |
| `/api/feedback` | POST | Generate AI-based feedback |

**Example request:**

```bash
curl -X POST http://localhost/api/analyze_face \
-H "Content-Type: application/json" \
-d '{"image": "data:image/jpeg;base64,..."}'
```

---

## 🧠 Tech Stack

* **Frontend:** React + Vite, TailwindCSS  
* **Backend (AI):** Flask, DeepFace, OpenCV, OpenAI API  
* **Backend (Logic):** Node.js + Express  
* **Speech Processing:** SpeechRecognition, Pydub, FFmpeg  
* **Reverse Proxy:** Nginx  
* **Containerization:** Docker & Docker Compose  

---

## 🧰 Useful Commands

| Command | Description |
| -------- | ------------ |
| `docker-compose up --build` | Build and start all containers |
| `docker-compose down` | Stop and remove all containers |
| `docker-compose logs -f` | View live logs from all services |
| `docker system prune -a` | Clean up all unused Docker data |

---

## 🧩 Troubleshooting

* **Ports already in use?**  
  Stop existing services using those ports or modify them in `.env` and `docker-compose.yml`.

* **Changes not reflecting?**  
  Run `docker-compose up --build` again to rebuild with latest updates.

* **Nginx 502 Bad Gateway?**  
  Ensure both backends are healthy (`docker ps`) and reachable inside the network.

---

## 🏁 Done!

Visit **http://localhost** to start your AI-powered interview simulation.  
Docker will take care of running everything — no manual setup needed.