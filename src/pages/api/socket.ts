import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';
import Trie from '../../lib/trie';
import fs from 'fs';
import path from 'path';

type SocketServerWithIO = {
  io?: IOServer;
};

const trie = new Trie();
let abuseLoaded = false;

async function loadAbuses() {
  if (abuseLoaded) return;
  try {
    const res = await fetch('https://example.com/abuses.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Remote fetch failed');
    const words: string[] = await res.json();
    for (const w of words) trie.insert(w);
    console.log(`[abuse] Loaded ${words.length} remote words`);
  } catch (e) {
    const p = path.join(process.cwd(), 'abuses.json');
    const data = fs.readFileSync(p, 'utf-8');
    const words: string[] = JSON.parse(data);
    for (const w of words) trie.insert(w);
    console.log(`[abuse] Loaded ${words.length} local words`);
  }
  abuseLoaded = true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await loadAbuses();
  const socketWithServer = res.socket as typeof res.socket & { server: any };

  if (!socketWithServer || !socketWithServer.server) {
    res.status(500).end('Socket server not available');
    return;
  }

  const srv: SocketServerWithIO = socketWithServer.server as SocketServerWithIO;
  if (!srv.io) {
    const io = new IOServer(socketWithServer.server, {
      path: '/api/socket_io', 
    });
    srv.io = io;

    io.on('connection', (socket) => {
      console.log('[socket] client connected');

      socket.on('set username', (username: string) => {
        socket.data.username = (username || 'Anonymous').slice(0, 32);
        io.emit('chat message', `yoyo ${socket.data.username} joined the chat.`);
      });

      socket.on('chat message', (msg: string) => {
        const name = (socket.data.username as string) || 'Anonymous';
        const clean = trie.censor(String(msg || ''));
        io.emit('chat message', `${name}: ${clean}`);
      });

      socket.on('disconnect', () => {
        const name = (socket.data.username as string) || 'Anonymous';
        io.emit('chat message', `lalala ${name} left the chat.`);
      });
    });
      console.log('[socket] server initialized');
    }
  }