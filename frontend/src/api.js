import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000https://learn-igbo-backend.onrender.com', 
});

export default api;