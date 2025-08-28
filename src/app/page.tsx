'use client';

import { useEffect, useState } from 'react';
import { getSocket } from './socket-client';

export default function Page() {
  const [messages, setMessages] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
  
    fetch('/api/socket').catch(() => {});
    const s = getSocket();

    const onMsg = (msg: string) => setMessages((prev) => [...prev, msg]);
    s.on('chat message', onMsg);

    return () => {
      s.off('chat message', onMsg);
    };
  }, []);

  const join = () => {
    if (!username.trim()) return;
    const s = getSocket();
    s.emit('set username', username.trim());
    setJoined(true);
  };

  const send = () => {
    if (!input.trim()) return;
    const s = getSocket();
    s.emit('chat message', input);
    setInput('');
  };

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', padding: 16, fontFamily: 'system-ui' }}>
      <h1 style={{ marginBottom: 16 }}>Socket.IO Chat</h1>

      {!joined ? (
        <div style={{ display: 'grid', gap: 8 }}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd' }}
          />
          <button onClick={join} style={{ padding: 10, borderRadius: 8 }}>
            Join
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 12,
              minHeight: 240,
              marginBottom: 12,
              overflowY: 'auto',
              background: '#fafafa',
            }}
          >
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
              {messages.map((m, i) => (
                <li key={i} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
              onKeyDown={(e) => (e.key === 'Enter' ? send() : undefined)}
              style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd' }}
            />
            <button onClick={send} style={{ padding: '0 16px', borderRadius: 8 }}>
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
