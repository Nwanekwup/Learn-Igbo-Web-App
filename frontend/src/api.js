import axios from 'axios';

const api = axios.create({
  baseURL: 'https://learn-igbo-backend.onrender.com', 
});

export default api;