import { io } from 'socket.io-client';
import { apiBaseUrl } from './api';

const socket = io(apiBaseUrl, {
	transports: ['websocket', 'polling'],
});

if (typeof window !== 'undefined') {
	window.socket = socket;
}

export default socket;