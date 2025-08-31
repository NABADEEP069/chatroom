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
    <div className="relative flex flex-col md:flex-row h-screen mt-9">

      
      <GoogleGeminiEffect
        pathLengths={[]}
        className="pointer-events-none absolute inset-0 z-0"
      />

      
      <aside className="hidden md:flex md:w-48 p-6 flex-col items-start space-y-4 z-10 ">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 grid grid-cols-3 gap-1">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-green-500 rounded-full"
              ></div>
            ))}
          </div>
          <span className="text-lg font-medium text-green-500">Chatapp</span>
        </div>
      </aside>

    
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 mt-20">
        <div className="w-full max-w-lg">
          {!joined ? (
            <div className="grid gap-2">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="p-2 rounded border border-gray-300 w-full"
              />
              <button
                onClick={join}
                className="p-2 rounded bg-green-500 text-black hover:bg-green-600 w-full"
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

              <div className="grid grid-cols-[1fr_auto] gap-2 mt-20">
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
      </main>
    </div>
  );
}
