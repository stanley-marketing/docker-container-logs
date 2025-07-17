"use client";
import { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { cn } from '../../../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace(/^http/, 'ws');

type Message = { role: 'user' | 'assistant'; content: string };

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Establish socket connection once
  useEffect(() => {
    const token = localStorage.getItem('dlm_token') || '';
    const socket = io(WS_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('answer', (payload: { answer: string }) => {
      const assistantMsg: Message = { role: 'assistant', content: payload.answer };
      setMessages(prev => [...prev, assistantMsg]);
      setLoading(false);
    });

    socket.on('error', (err: { error: string }) => {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.error}` }]);
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // emit via socket
    socketRef.current?.emit('ask', {
      question: userMsg.content,
      history: [...messages, userMsg]
    });
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <section className="flex flex-col h-[calc(100vh_-_200px)] max-w-xl">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              'whitespace-pre-wrap p-2 rounded-md text-sm',
              m.role === 'user'
                ? 'bg-blue-100 text-blue-900 self-end'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50'
            )}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="mt-4 space-y-2">
        <textarea
          className="w-full p-2 border rounded-md"
          rows={3}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <div className="flex gap-2">
          <button
            className={cn(
              'px-4 py-2 text-white rounded-md',
              loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
            )}
            disabled={loading}
            onClick={sendMessage}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
          <button
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
            onClick={handleNewChat}
            disabled={loading}
          >
            New Chat
          </button>
        </div>
      </div>
    </section>
  );
} 