// Set to true when you have deployed your backend URL
let IS_PROD = false;

const server = process.env.REACT_APP_BACKEND_URL || (IS_PROD ? "https://your-deployed-backend.onrender.com" : "http://localhost:8000");

export default server;
