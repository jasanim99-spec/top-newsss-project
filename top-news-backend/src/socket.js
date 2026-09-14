import { Server } from 'socket.io';

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8080'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ [Socket.IO] Client connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  console.log('⚡ [Socket.IO] Real-time engine initialized.');
  return io;
}

export function getIO() {
  return io;
}

// -------------------------------------------------------------------------
// REAL-TIME BROADCAST EVENT EMITTERS
// -------------------------------------------------------------------------

export function emitNewsCreated(article) {
  if (io) {
    console.log(`📡 [Socket.IO Broadcast] Emitting news:created for article ID: "${article.id}"`);
    io.emit('news:created', { article });
  }
}

export function emitNewsUpdated(article) {
  if (io) {
    console.log(`📡 [Socket.IO Broadcast] Emitting news:updated for article ID: "${article.id}"`);
    io.emit('news:updated', { article });
  }
}

export function emitNewsDeleted(id) {
  if (io) {
    console.log(`📡 [Socket.IO Broadcast] Emitting news:deleted for article ID: "${id}"`);
    io.emit('news:deleted', { id });
  }
}

export function emitVideoCreated(video) {
  if (io) {
    console.log(`📡 [Socket.IO Broadcast] Emitting video:created for video ID: "${video.id}"`);
    io.emit('video:created', { video });
  }
}

export function emitVideoUpdated(video) {
  if (io) {
    console.log(`📡 [Socket.IO Broadcast] Emitting video:updated for video ID: "${video.id}"`);
    io.emit('video:updated', { video });
  }
}

export function emitVideoDeleted(id) {
  if (io) {
    console.log(`📡 [Socket.IO Broadcast] Emitting video:deleted for video ID: "${id}"`);
    io.emit('video:deleted', { id });
  }
}

export function emitSettingsUpdated(settings) {
  if (io) {
    console.log(`📡 [Socket.IO Broadcast] Emitting settings:updated`);
    io.emit('settings:updated', { settings });
  }
}
