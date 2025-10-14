# 🚀 VirtueSense: AI-Powered Interview Practice Platform

VirtueSense is an intelligent interview simulation platform that analyzes **facial expressions**, **voice tone**, and **speech clarity** to help users improve communication skills and confidence in interviews.  
It combines **Flask**, **React**, **OpenAI**, and **DeepFace** to deliver real-time emotional and linguistic feedback.

---

## 🧠 Features

- 🎤 Real-time **speech-to-text** analysis using SpeechRecognition and OpenAI  
- 😊 **Emotion & facial expression** detection with DeepFace and OpenCV  
- 🧩 Seamless **Flask + React integration** via Nginx reverse proxy  
- 🔊 Supports **audio-based feedback** and **text-based evaluation**  
- 📊 Provides structured insights into clarity, tone, and confidence  

---

## 📦 Prerequisites

Before starting, make sure you have these installed:

| Dependency | Minimum Version | Purpose |
|-------------|----------------|----------|
| **Python** | 3.8+ | Backend (Flask) |
| **Node.js** | 14+ | Frontend (React) |
| **Git** | — | Clone repository |
| **FFmpeg** | Latest | Audio conversion & processing |
| **Nginx** | Latest | Reverse proxy & routing |

### 🔧 FFmpeg Installation

- **Windows:** [Download](https://ffmpeg.org/download.html) → Add `bin` folder to PATH  
- **macOS:** `brew install ffmpeg`  
- **Linux (Debian/Ubuntu):**
  ```bash
  sudo apt update && sudo apt install ffmpeg
🌐 Nginx Installation
Windows: Download Nginx → extract to C:\nginx

macOS: brew install nginx

Linux:

bash
Copy code
sudo apt update && sudo apt install nginx
🛠️ Step 1: Project Setup
Clone the Repository
bash
Copy code
git clone https://github.com/PaperKidz/IntervueSense.git
cd IntervueSense
Configure Environment Variables
Navigate to the backend folder:

bash
Copy code
cd Backend
Copy the example environment file:

Windows: copy .env.example .env

macOS/Linux: cp .env.example .env

Edit .env and add your OpenAI API key:

bash
Copy code
OPENAI_API_KEY="sk-your-secret-key"
Return to the root folder:

bash
Copy code
cd ..
⚙️ Step 2: Install Dependencies
Backend Setup
bash
Copy code
cd Backend
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install required packages
pip install -r requirements.txt
Frontend Setup
bash
Copy code
cd ../Frontend
npm install
🌍 Step 3: Configure Nginx
The provided nginx.conf routes frontend and backend traffic automatically.

Locate the nginx.conf file in the project root.

Copy it to your Nginx configuration directory:

Windows: C:\nginx\conf\nginx.conf

macOS/Linux: /etc/nginx/nginx.conf

Replace the default Nginx config file with this one.

▶️ Step 4: Run the Application
Once setup is complete, you can start everything through Nginx.

Start Nginx

bash
Copy code
# Windows
cd C:\nginx
start nginx

# macOS/Linux
sudo nginx
Run the Frontend and Backend Together

bash
Copy code
cd Frontend
npm run dev
Open your browser and go to:

arduino
Copy code
http://localhost
Nginx will automatically route:

/api → Flask backend (port 5000)

/ → React frontend (port 3000)

🧩 Project Structure
css
Copy code
IntervueSense/
├── Backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   └── ...
├── Frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── nginx.conf
└── README.md
🧠 Tech Stack
Frontend: React, TailwindCSS

Backend: Flask, DeepFace, OpenCV, OpenAI API

Speech Processing: SpeechRecognition, Pydub, FFmpeg

Reverse Proxy: Nginx

🔌 API Endpoints
Endpoint	Method	Description
/analyze_face	POST	Analyzes facial emotion from base64 or uploaded image
/analyze_audio	POST	Processes audio input for tone and emotion
/transcribe	POST	Converts user audio speech to text
/feedback	POST	Generates AI-driven feedback based on performance

Example cURL:

bash
Copy code
curl -X POST http://localhost/api/analyze_face \
-H "Content-Type: application/json" \
-d '{"image": "data:image/jpeg;base64,..."}'
💡 Future Enhancements
Integrate gesture detection

Add live confidence scoring

Provide personalized coaching feedback

