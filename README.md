# 🚀 Project Setup and Run Guide

This guide will help you install dependencies and run both the **backend** and **frontend** of the project smoothly.

---

## 📦 Prerequisites

Make sure you have the following installed before running the project:

- **Python 3.8+**
- **Node.js** (v14 or above)
- **npm** (comes with Node.js)
- **pip** (Python package manager)

---

## 🛠️ Step 1: Install Dependencies

### Backend Setup
1. Open a terminal in the project root directory.  
2. Navigate to the backend folder:
   ```
   cd backend
   ```

3. Install required Python dependencies:

   ```pip install -r requirements.txt```
 

### Frontend Setup
1. Open a new terminal window (keep the backend terminal running).  
2. Navigate to the frontend folder:
  
   ```cd frontend```
  
3. Install necessary Node.js packages:

   ```npm install```


---

## ▶️ Step 2: Run the Project

### Run the Backend
1. In the backend terminal, run:

   ```python app.py```

2. Wait for the backend server to fully load (you should see a message like “Running on http://127.0.0.1:5000/”).

### Run the Frontend
1. Open a **new terminal** window.  
2. Navigate to the frontend directory:

   ```cd frontend```

3. Start the frontend application:

   ```npm start```

4. The frontend should automatically open in your default browser (usually at [http://localhost:3000](http://localhost:3000)).

---

## ⚙️ Notes

- Make sure both the backend and frontend are running simultaneously.  
- If you encounter issues with dependencies, try reinstalling them using:

  ```pip install --upgrade -r requirements.txt```
  ```npm install```

---
- For troubleshooting, check the console output in both terminals for error messages.

---

## ✅ You’re All Set!

Once both servers are running, your project should be live and ready to use. 🎉
