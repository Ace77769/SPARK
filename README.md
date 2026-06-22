# ⭐ SPARK Learning Platform

**SPARK** is a full-stack AI-powered gamified learning platform designed for school students and teachers, enabling interactive learning, automated quiz generation, and seamless content delivery through a scalable microservices architecture.

---

## 🚀 Key Features

### 📚 AI Quiz Generation

Teachers can upload textbook PDFs, and the platform automatically extracts content and generates **validated multiple-choice quizzes** using **Groq Cloud LLM API** with high-speed inference.

### 🎯 Interactive Student Assessments

Students can:

* Attempt quizzes in real time
* Get instant feedback after submission
* View correct answers and explanations
* Track quiz history and performance dashboard

### 🎥 Rich Learning Resources

Teachers can upload:

* PDF Study Materials (Textbooks / Question Papers)
* Video Lectures (stored securely on Cloudinary CDN)

### 🎨 Gamified Learning Experience

Modern interactive UI with:

* Rich colorful dashboard
* Hover effects and smooth micro-animations
* Gamified student engagement design

---

## 🏗️ System Architecture

SPARK follows a **production-oriented 3-tier microservices architecture**.

```text
[ React Frontend ] (Port 3000)
        │
        ▼
[ Node.js + Express Backend ] (Port 5000)
        │
        ├──► MongoDB Atlas Cluster (Cloud Database)
        ├──► Cloudinary Storage API (Media Storage)
        │
        ▼
[ Python Flask AI Service ] (Port 8000)
        │
        ▼
[ Groq Cloud LLM API ]
```

Architecture Flow:

```text
Frontend → Express Backend → Python AI Service → Groq API
                              │
                              ▼
                      Quiz Generation Engine
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router DOM
* Tailwind CSS
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose ODM
* JWT Authentication

### AI Microservice

* Python Flask
* pdfplumber (PDF text extraction)
* Groq API Integration
* JSON-based Quiz Generation Pipeline

### Cloud Services

* MongoDB Atlas
* Cloudinary CDN
* Docker Containers
* Render Deployment

---

## ⚡ AI Quiz Generation Pipeline

The AI pipeline works as follows:

```text
Teacher Uploads PDF
        ↓
PDF Text Extraction using pdfplumber
        ↓
Text Preprocessing & Chunking
        ↓
Send Processed Text to Groq LLM API
        ↓
Generate Structured MCQ Quiz (JSON)
        ↓
Validate Response Format
        ↓
Send Quiz to Student Dashboard
```

This architecture reduces token consumption and enables scalable cloud-based AI generation.

---

## 🖥️ Local Development Setup

### Prerequisites

Required accounts/services:

* Groq API Key
* MongoDB Atlas Database Cluster
* Cloudinary Account

---

### Environment Configuration

Create:

**ai-service/.env**

```env
GROQ_API_KEY=your_api_key
GROQ_MODEL=gemma2-2b-it
```

**server/.env**

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

### Run Python AI Service

```bash
cd ai-service

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

python app.py
```

Runs on:

```text
http://localhost:8000
```

---

### Run Express Backend

```bash
cd server

npm install

npm start
```

Runs on:

```text
http://localhost:5000
```

---

### Run React Frontend

```bash
cd client

npm install

npm start
```

Runs on:

```text
http://localhost:3000
```

---

## 🐳 Docker Architecture

SPARK supports containerized development using Docker Compose.

Launch complete stack:

```bash
docker-compose up --build
```

Services:

```text
Frontend     → localhost:3000
Backend API  → localhost:5000
AI Service   → localhost:8000
```

Stop services:

```bash
docker-compose down
```

---

## ☁️ Production Deployment (Render)

SPARK is configured for cloud deployment using Docker containers on Render.

Deployment flow:

```text
GitHub Repository
        ↓
Render Blueprint Deployment
        ↓
Build Containers Automatically
        ↓
Connect Services
        ↓
Production Deployment
```

Services deployed:

* spark-frontend
* spark-backend
* spark-ai-service

Required Environment Variables:

```env
GROQ_API_KEY
GROQ_MODEL
MONGO_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

## 🔥 Production Engineering Highlights

This project demonstrates:

* Full-stack MERN development
* Microservices architecture design
* AI API integration with cloud-hosted LLMs
* Docker containerization
* Cloud deployment on Render
* Secure environment variable management
* External cloud database integration
* Scalable backend architecture

---

## 📌 Future Improvements

Planned enhancements:

* Adaptive quiz generation based on student performance
* AI-powered personalized learning recommendations
* Student leaderboard and reward system
* Teacher analytics dashboard
* Real-time classroom collaboration system

---

## 👨‍💻 Project Goal

SPARK aims to bridge traditional education with AI-powered learning by giving teachers automated content generation tools and students an engaging personalized learning experience.

Built as a **production-level scalable educational technology platform**.
