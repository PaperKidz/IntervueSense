# 🚀 VirtueSense: AI-Powered Interview Practice Platform

This guide will help you set up and run the full VirtueSense application, including the frontend, backend, and Nginx reverse proxy.

------------------------------------------------------------
# 📦 Prerequisites
------------------------------------------------------------

Make sure you have the following installed on your system:

- Python (3.8 or newer)
- Node.js (v14 or newer) & npm
- Git
- FFmpeg: Required for audio processing. Must be installed and accessible in your system's PATH.

Windows: Download from https://ffmpeg.org/download.html and add the bin folder to your system PATH  
macOS:
```brew install ffmpeg```  
Linux (Debian/Ubuntu):
```sudo apt update && sudo apt install ffmpeg```

- Nginx: The web server used to route requests to the frontend and backend.

Windows: Download from https://nginx.org/en/download.html and extract (e.g., to C:\nginx)  
macOS:
```brew install nginx```  
Linux (Debian/Ubuntu):
```sudo apt update && sudo apt install nginx```

------------------------------------------------------------
# 🛠️ Step 1: Project Setup & Configuration
------------------------------------------------------------

1. Clone the Repository  
```git clone https://github.com/PaperKidz/IntervueSense.git```  
```cd IntervueSense```

2. Configure Environment Variables  

Navigate to the Backend directory  
```cd Backend```

Create a copy of the example environment file  
For Windows  
```copy .env.example .env```  

For macOS/Linux  
```cp .env.example .env```

Open the newly created .env file and add your OpenAI API key:  
OPENAI_API_KEY="sk-YourSecretKeyHere"

Return to the root directory  
```cd ..```

3. Configure Nginx  

The Nginx reverse proxy directs browser requests to the correct service (React frontend or Flask backend).  

Locate the nginx.conf file in the root of this repository.  
Find the Nginx installation directory on your system (e.g., C:\nginx\conf on Windows).  
Replace the default nginx.conf file in that directory with the one from this project.

------------------------------------------------------------
# ⚙️ Step 2: Install Dependencies
------------------------------------------------------------

Backend Setup  
```cd Backend```

Create and activate a Python virtual environment  
```python -m venv venv```

Activate it (Windows)  
```.\venv\Scripts\activate```

Activate it (macOS/Linux)  
```source venv/bin/activate```

Install the required Python dependencies  
```pip install -r requirements.txt```

Frontend Setup  
Open a new, separate terminal in the project's root directory  
```cd ../Frontend```

Install the necessary Node.js packages  
```npm install```

------------------------------------------------------------
# ▶️ Step 3: Run the Application
------------------------------------------------------------

To run the application, you need to have three separate terminal windows open.

1️⃣ Start the Backend Server  
(First terminal, with the Python virtual environment activated)  
```cd Backend```  
```python app.py```  
Wait for the server to start — it should be listening on port 5000.

2️⃣ Start the Frontend Server  
(Second terminal)  
```cd Frontend```  
```npm start```  
This will start the React development server on port 3000.  
Do NOT open this URL directly.

3️⃣ Start the Nginx Server  
(Third terminal)  
On Windows:  
```cd C:\nginx```  
```start nginx```

Nginx will now be running in the background, serving your application.
