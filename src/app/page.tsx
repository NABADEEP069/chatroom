'use client';

import { useEffect, useState } from 'react';
import { getSocket } from './socket-client';
import { GoogleGeminiEffect } from '@/components/ui/google-gemini-effect';

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
    <div className="relative max-w-lg mx-auto my-8 p-4 font-sans">
      {/* GoogleGeminiEffect stays in background */}
      <GoogleGeminiEffect
        pathLengths={[]}
        className="pointer-events-none absolute inset-0 z-0"
      />

      {/* Content stays above */}
      <div className="relative z-10">
        <h1 className="mb-4 text-xl font-bold">Socket.IO Chat</h1>

        {!joined ? (
          <div className="grid gap-2">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="p-2 rounded border border-gray-300"
            />
            <button
              onClick={join}
              className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Join
            </button>
          </div>
        ) : (
          <>
            <div className="border border-gray-200 rounded p-3 min-h-[240px] mb-3 overflow-y-auto bg-gray-50">
              <ul className="list-none p-0 m-0 grid gap-1">
                {messages.map((m, i) => (
                  <li key={i} className="whitespace-pre-wrap break-words">
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
                onKeyDown={(e) => (e.key === 'Enter' ? send() : undefined)}
                className="p-2 rounded border border-gray-300"
              />
              <button
                onClick={send}
                className="px-4 rounded bg-green-500 text-white hover:bg-green-600"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
