import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { db, notifications } from './db.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-student-guide-key';

export function setupWebSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000',
      credentials: true
    }
  });

  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    // Parse cookies from headers
    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) {
      return next(new Error('Authentication error'));
    }

    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    if (!tokenMatch) {
      return next(new Error('Authentication error'));
    }

    const token = tokenMatch[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      socket.data.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    // Join a personal room to receive private notifications
    socket.join(`user:${userId}`);

    // ----- Study Room Features -----
    socket.on('join_study_room', () => {
      socket.join('study_room');
      // Broadcast to others that someone joined
      socket.to('study_room').emit('user_joined', { userId });
      
      // Send current room size to the user
      const roomSize = io.sockets.adapter.rooms.get('study_room')?.size || 0;
      io.to('study_room').emit('room_stats', { activeUsers: roomSize });
    });

    socket.on('leave_study_room', () => {
      socket.leave('study_room');
      socket.to('study_room').emit('user_left', { userId });
      const roomSize = io.sockets.adapter.rooms.get('study_room')?.size || 0;
      io.to('study_room').emit('room_stats', { activeUsers: roomSize });
    });

    // Sync pomodoro timer
    socket.on('sync_timer', (data: { timeLeft: number, status: string }) => {
      // Send to everyone in the study room except sender
      socket.to('study_room').emit('timer_update', { userId, ...data });
    });

    socket.on('disconnect', () => {
      const roomSize = io.sockets.adapter.rooms.get('study_room')?.size || 0;
      io.to('study_room').emit('room_stats', { activeUsers: roomSize });
    });
  });

  return io;
}
