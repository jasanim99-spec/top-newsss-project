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
    console.log('⚡ [Socket.IO Client] Connected to backend real-time server:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 [Socket.IO Client] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.warn('⚠️ [Socket.IO Client] Connection note:', error.message);
  });

  // Real-time event listeners
  socket.on('news:created', (payload) => {
    console.log('📡 [Socket.IO Event] news:created received:', payload);
    window.dispatchEvent(new CustomEvent('topnews_news_created', { detail: payload }));
    window.dispatchEvent(new CustomEvent('topnews_realtime_refetch', { detail: payload }));
  });

  socket.on('news:updated', (payload) => {
    console.log('📡 [Socket.IO Event] news:updated received:', payload);
    window.dispatchEvent(new CustomEvent('topnews_news_updated', { detail: payload }));
    window.dispatchEvent(new CustomEvent('topnews_realtime_refetch', { detail: payload }));
  });

  socket.on('news:deleted', (payload) => {
    console.log('📡 [Socket.IO Event] news:deleted received:', payload);
    window.dispatchEvent(new CustomEvent('topnews_news_deleted', { detail: payload }));
    window.dispatchEvent(new CustomEvent('topnews_realtime_refetch', { detail: payload }));
  });

  socket.on('video:created', (payload) => {
    console.log('📡 [Socket.IO Event] video:created received:', payload);
    window.dispatchEvent(new CustomEvent('topnews_realtime_refetch', { detail: payload }));
  });

  socket.on('video:updated', (payload) => {
    console.log('📡 [Socket.IO Event] video:updated received:', payload);
    window.dispatchEvent(new CustomEvent('topnews_realtime_refetch', { detail: payload }));
  });

  socket.on('video:deleted', (payload) => {
    console.log('📡 [Socket.IO Event] video:deleted received:', payload);
    window.dispatchEvent(new CustomEvent('topnews_realtime_refetch', { detail: payload }));
  });

  socket.on('settings:updated', (payload) => {
    console.log('📡 [Socket.IO Event] settings:updated received:', payload);
    if (payload && payload.settings) {
      try {
        localStorage.setItem('topnews_site_settings', JSON.stringify(payload.settings));
        window.dispatchEvent(new CustomEvent('topnews_settings_updated', { detail: payload.settings }));
      } catch (e) {}
    }
  });

  return socket;
}

export function getSocketClient(): Socket | null {
  return socket || initSocketClient();
}
