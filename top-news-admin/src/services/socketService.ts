import { io, Socket } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3000';

let socket: Socket | null = null;

export function initSocketClient(): Socket {
  if (socket) return socket;

  socket = io(API_BASE_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('⚡ [Admin Socket.IO Client] Connected to backend real-time server:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 [Admin Socket.IO Client] Disconnected:', reason);
  });

  socket.on('news:created', (payload) => {
    window.dispatchEvent(new CustomEvent('topnews_realtime_refetch', { detail: payload }));
  });

  socket.on('news:updated', (payload) => {
    window.dispatchEvent(new CustomEvent('topnews_realtime_refetch', { detail: payload }));
  });

  socket.on('news:deleted', (payload) => {
    window.dispatchEvent(new CustomEvent('topnews_realtime_refetch', { detail: payload }));
  });

  return socket;
}

export function getSocketClient(): Socket | null {
  return socket || initSocketClient();
}
