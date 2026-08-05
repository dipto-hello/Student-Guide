import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, ALLOWED_ORIGINS } from './config.js';
import { logger } from './logger.js';

/** Identifiers a client may broadcast into a shared room. */
interface TimerPayload {
  timeLeft: number;
  status: string;
}

const STUDY_ROOM = 'study_room';

/** Max events per socket per window, to stop one client flooding the room. */
const EVENT_LIMIT = 60;
const EVENT_WINDOW_MS = 10_000;

export function setupWebSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: ALLOWED_ORIGINS,
      credentials: true,
    },
    // Drop dead connections faster than the default so room counts stay honest.
    pingTimeout: 20_000,
    pingInterval: 25_000,
    maxHttpBufferSize: 1e5, // 100kb — no large payloads are expected
  });

  // Authenticate every connection from the same cookie the REST API uses.
  io.use((socket, next) => {
    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) {
      return next(new Error('Authentication error'));
    }

    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    if (!tokenMatch) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(decodeURIComponent(tokenMatch[1]), JWT_SECRET) as {
        id: string;
      };
      socket.data.userId = decoded.id;
      socket.data.eventCount = 0;
      socket.data.windowStart = Date.now();
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  /**
   * Per-socket token bucket.
   *
   * `sync_timer` fires on an interval from every client in the room, so an
   * unthrottled or malicious client can otherwise fan out thousands of
   * broadcasts per second to every other participant.
   */
  function withinRateLimit(socket: Socket): boolean {
    const now = Date.now();
    if (now - socket.data.windowStart > EVENT_WINDOW_MS) {
      socket.data.windowStart = now;
      socket.data.eventCount = 0;
    }
    socket.data.eventCount += 1;
    return socket.data.eventCount <= EVENT_LIMIT;
  }

  /** Room size after the current event has been applied. */
  function roomSize(): number {
    return io.sockets.adapter.rooms.get(STUDY_ROOM)?.size ?? 0;
  }

  io.on('connection', (socket: Socket) => {
    const userId: string = socket.data.userId;

    // Personal room for private notifications.
    socket.join(`user:${userId}`);

    socket.on('join_study_room', () => {
      if (!withinRateLimit(socket)) return;
      socket.join(STUDY_ROOM);
      socket.to(STUDY_ROOM).emit('user_joined', { userId });
      io.to(STUDY_ROOM).emit('room_stats', { activeUsers: roomSize() });
    });

    socket.on('leave_study_room', () => {
      if (!withinRateLimit(socket)) return;
      socket.leave(STUDY_ROOM);
      socket.to(STUDY_ROOM).emit('user_left', { userId });
      io.to(STUDY_ROOM).emit('room_stats', { activeUsers: roomSize() });
    });

    socket.on('sync_timer', (data: unknown) => {
      if (!withinRateLimit(socket)) return;

      // Validate inline rather than re-broadcasting whatever the client sent —
      // every other participant renders this payload.
      const payload = data as Partial<TimerPayload>;
      if (
        typeof payload?.timeLeft !== 'number' ||
        !Number.isFinite(payload.timeLeft) ||
        typeof payload?.status !== 'string' ||
        payload.status.length > 32
      ) {
        return;
      }

      socket.to(STUDY_ROOM).emit('timer_update', {
        userId,
        timeLeft: payload.timeLeft,
        status: payload.status,
      });
    });

    socket.on('disconnect', () => {
      // `disconnect` fires after the socket has left its rooms, so the count
      // read here already excludes it.
      io.to(STUDY_ROOM).emit('room_stats', { activeUsers: roomSize() });
    });

    socket.on('error', (error) => {
      logger.warn('Socket error', {
        userId,
        reason: error instanceof Error ? error.message : String(error),
      });
    });
  });

  return io;
}
