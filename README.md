# 📹 Zoomora - Real-Time Video Calling & Conferencing App

Zoomora is a full-stack real-time video conferencing web application built with **React**, **Node.js/Express**, **WebRTC**, and **Socket.io**. It enables users to connect seamlessly via video calls, real-time chat, and screen sharing.

---

## 🚀 Features

- **Real-Time Video & Audio**: Peer-to-peer audio and video streaming using WebRTC.
- **Screen Sharing**: Easily share your screen with participants.
- **In-Meeting Chat**: Send and receive instant messages during video calls.
- **User Authentication**: Secure Sign-up, Login, and JWT/token authentication.
- **Meeting History**: Track and view past meeting logs.
- **Guest Access**: Join a meeting directly without signing in.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (v19)
- **Material UI (MUI)**
- **Socket.io Client**
- **WebRTC**
- **React Router** (v7)

### Backend
- **Node.js** & **Express.js**
- **Socket.io** (WebSockets)
- **MongoDB** & **Mongoose**
- **Bcrypt** (Password hashing)

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/saurabh3689/Zoomora.git
cd Zoomora-Video-Call
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` file in the `backend` folder:
   ```env
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:8000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`.

---

## 👤 Author

- **GitHub**: [@saurabh3689](https://github.com/saurabh3689)
- **Email**: [dsaurabh077@gmail.com](mailto:dsaurabh077@gmail.com)

---

## 📄 License

This project is licensed under the ISC License.
