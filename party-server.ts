import type { Plugin, ViteDevServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage, ServerResponse } from 'http';

interface RoomMember {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  avatarUrl: string;
  isReady: boolean;
  isHost: boolean;
  isOnline: boolean;
  joinedAt: string;
  lastSeenAt: string;
}

interface Room {
  id: string;
  roomCode: string;
  hostId: string;
  status: string;
  settings: any;
  createdAt: string;
  updatedAt: string;
  members: RoomMember[];
}

// In-memory Room and WebSocket registry
const rooms = new Map<string, Room>();
const roomSockets = new Map<string, Set<WebSocket>>();

export function partyServerPlugin(): Plugin {
  return {
    name: 'party-server-plugin',
    configureServer(server: ViteDevServer) {
      if (!server.httpServer) return;

      const wss = new WebSocketServer({ noServer: true });

      // Handle WebSocket upgrade
      server.httpServer.on('upgrade', (req, socket, head) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        if (url.pathname === '/ws') {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
          });
        }
      });

      // WebSocket Connection handling
      wss.on('connection', (ws: WebSocket) => {
        let currentRoomCode: string | null = null;

        ws.on('message', (data: string) => {
          try {
            const message = JSON.parse(data.toString());

            if (message.type === 'SUBSCRIBE') {
              const code = (message.roomCode || '').toUpperCase();
              currentRoomCode = code;

              if (!roomSockets.has(code)) {
                roomSockets.set(code, new Set());
              }
              roomSockets.get(code)!.add(ws);

              // Acknowledge subscription
              ws.send(JSON.stringify({ type: 'SUBSCRIBED', roomCode: code }));
            } else if (message.type === 'BROADCAST') {
              const code = (message.roomCode || currentRoomCode || '').toUpperCase();
              const eventType = message.event;
              const payload = message.payload;

              // Forward broadcast to ALL clients in this room (except sender if wanted, or all)
              const subscribers = roomSockets.get(code);
              if (subscribers) {
                const broadcastMsg = JSON.stringify({
                  type: eventType,
                  payload,
                  timestamp: Date.now(),
                });

                subscribers.forEach((client) => {
                  if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(broadcastMsg);
                  }
                });
              }
            }
          } catch (err) {
            console.error('Error handling WebSocket message:', err);
          }
        });

        ws.on('close', () => {
          if (currentRoomCode && roomSockets.has(currentRoomCode)) {
            const set = roomSockets.get(currentRoomCode);
            set?.delete(ws);
            if (set && set.size === 0) {
              roomSockets.delete(currentRoomCode);
            }
          }
        });

        ws.on('error', (err) => {
          console.error('WebSocket client error:', err);
        });
      });

      // HTTP REST Middleware for Cross-Device Room discovery
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);

        // Helper to send JSON response
        const sendJson = (status: number, data: any) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.end(JSON.stringify(data));
        };

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.end();
          return;
        }

        // 1. GET /api/rooms/:code
        if (req.method === 'GET' && url.pathname.startsWith('/api/rooms/')) {
          const code = url.pathname.replace('/api/rooms/', '').trim().toUpperCase();
          const room = rooms.get(code);
          if (room) {
            sendJson(200, { success: true, room });
          } else {
            sendJson(404, { success: false, error: `Room ${code} does not exist.` });
          }
          return;
        }

        // Helper to parse JSON body
        const parseBody = (): Promise<any> => {
          return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch (e) {
                reject(e);
              }
            });
            req.on('error', reject);
          });
        };

        // 2. POST /api/rooms (Create Room)
        if (req.method === 'POST' && url.pathname === '/api/rooms') {
          try {
            const body = await parseBody();
            const code = (body.roomCode || '').toUpperCase();
            const room: Room = {
              id: body.id,
              roomCode: code,
              hostId: body.hostId,
              status: body.status || 'waiting',
              settings: body.settings,
              createdAt: body.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              members: body.members || [],
            };

            rooms.set(code, room);
            console.log(`[PARTY SERVER] Room created: ${code} by ${body.hostId}`);
            sendJson(201, { success: true, room });
          } catch (err: any) {
            sendJson(400, { success: false, error: err.message });
          }
          return;
        }

        // 3. POST /api/rooms/:code/join
        if (req.method === 'POST' && url.pathname.endsWith('/join')) {
          const parts = url.pathname.split('/');
          const code = parts[parts.length - 2]?.toUpperCase();
          const room = rooms.get(code);

          if (!room) {
            sendJson(404, { success: false, error: `Room ${code} not found.` });
            return;
          }

          try {
            const body = await parseBody();
            const member: RoomMember = body.member;

            const existingIdx = room.members.findIndex((m) => m.userId === member.userId);
            if (existingIdx >= 0) {
              room.members[existingIdx] = {
                ...room.members[existingIdx],
                ...member,
                isOnline: true,
              };
            } else {
              room.members.push(member);
            }
            room.updatedAt = new Date().toISOString();

            console.log(`[PARTY SERVER] Player ${member.username} joined room ${code}. Total: ${room.members.length}`);

            // Broadcast to all connected WebSocket subscribers in this room
            const subscribers = roomSockets.get(code);
            if (subscribers) {
              const broadcastMsg = JSON.stringify({
                type: 'MEMBER_JOINED',
                payload: {
                  newMember: member,
                  members: room.members,
                },
                timestamp: Date.now(),
              });
              subscribers.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(broadcastMsg);
                }
              });
            }

            sendJson(200, { success: true, room });
          } catch (err: any) {
            sendJson(400, { success: false, error: err.message });
          }
          return;
        }

        // 4. POST /api/rooms/:code/update
        if (req.method === 'POST' && url.pathname.endsWith('/update')) {
          const parts = url.pathname.split('/');
          const code = parts[parts.length - 2]?.toUpperCase();
          const room = rooms.get(code);

          if (!room) {
            sendJson(404, { success: false, error: `Room ${code} not found.` });
            return;
          }

          try {
            const body = await parseBody();
            Object.assign(room, body.room, { updatedAt: new Date().toISOString() });
            sendJson(200, { success: true, room });
          } catch (err: any) {
            sendJson(400, { success: false, error: err.message });
          }
          return;
        }

        next();
      });
    },
  };
}
