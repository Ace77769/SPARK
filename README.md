# ⭐ SPARK Learning Platform

SPARK is a modern, gamified learning platform for school students and teachers. 

## 🚀 Key Features
- **AI Quiz Generation**: Teachers upload textbook PDFs to automatically generate validated multiple-choice quizzes using Google's **Gemini 1.5 Flash API**.
- **Interactive Quizzes**: Students can take quizzes, get instant feedback, view correct answers, and review their history dashboard.
- **Rich Study Materials**: Teachers can upload PDFs (Textbooks/Question Papers) and embed or upload Video lectures (stored on Cloudinary).
- **Gamified Visuals**: Rich, colorful, interactive theme with beautiful hover elements and micro-animations.

---

## 🏗️ Architecture Design
SPARK is structured as a robust 3-tier containerized architecture:

```
[ React SPA ] (Port 3000)
     │
     ▼ (Proxied via Nginx / Webpack)
[ Node/Express Backend ] (Port 5000)
     │
     ├───► [ MongoDB Atlas Cluster ] (External cloud database)
     ├───► [ Cloudinary Storage API ] (External cloud file storage)
     │
     ▼ (Base64 JSON HTTP Request)
[ Python Flask AI Service ] (Port 8000) ───► [ Google Gemini LLM API ] (External cloud LLM)
```

---

## 🛠️ Local Development (Standard Mode)

### Prerequisites
1. **Google Gemini API Key**: Get a free key instantly from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. **MongoDB Atlas Account**: Set up a free sandbox database cluster.
3. **Cloudinary Account**: Sign up on [Cloudinary](https://cloudinary.com/) for media storage.

### Local Setup
1. Clone the project and configure environment files:
   - Create `ai-service/.env` (see `ai-service/.env.example`) and add your `GEMINI_API_KEY`.
   - Create `server/.env` (see `server/.env.example`) and add your `MONGO_URI`, `JWT_SECRET`, and Cloudinary keys.

2. **Run AI Microservice**:
   ```bash
   cd ai-service
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

3. **Run Express Backend**:
   ```bash
   cd server
   npm install
   npm start # Node index.js
   ```

4. **Run React Frontend**:
   ```bash
   cd client
   npm install
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Setup (Recommended local testing)

You can launch the entire system locally with one command using Docker:

```bash
# Build and run all containers
docker-compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API status check**: [http://localhost:5000/api/status](http://localhost:5000/api/status)
- **AI Service health check**: [http://localhost:8000/health](http://localhost:8000/health)

To stop the services:
```bash
docker-compose down
```

---

## ☁️ Deploy to Render (One-Click)

SPARK includes a `render.yaml` blueprint. To deploy the entire portfolio stack:

1. Push your updated codebase to a personal GitHub repository.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **"New"** → **"Blueprint"**.
4. Connect your GitHub repository.
5. Render will automatically parse the services from `render.yaml`:
   - **`spark-ai-service`** (Python Flask)
   - **`spark-backend`** (Express)
   - **`spark-frontend`** (React + Nginx)
6. Supply the required environment secrets in the Render setup wizard:
   - `GEMINI_API_KEY` (Your Google API key)
   - `MONGO_URI` (MongoDB connection string)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
7. Click **Deploy**. Render will build and link the containers automatically!
