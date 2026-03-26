import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');
console.log('Socket created:', socket.id); // to see if connected
window.socket = socket;
export default socket;