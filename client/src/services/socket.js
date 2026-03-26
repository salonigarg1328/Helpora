import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // your backend URL

// 👇 Add this line to expose socket globally
window.socket = socket;

// Optional: log to confirm it's created
console.log('🔥 Socket created, ID:', socket.id);

export default socket;