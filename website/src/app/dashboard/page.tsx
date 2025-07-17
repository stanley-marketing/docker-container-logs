import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Summary {
  id: number;
  container: string;
  ts_start: string;
  ts_end: string;
  summary: string;
  cost_usd: number;
  created_at: string;
}

export default function DashboardPage() {
  'use client';
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: number; score: number }[]>([]);

  const fetchSummaries = async () => {
    try {
      const res = await fetch(`${API_URL}/summaries?limit=100`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dlm_token') || ''}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSummaries(data);
    } catch (err: unknown) {
      console.error('Failed to load summaries', err);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dlm_token') || ''}`
        },
        body: JSON.stringify({ question })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAnswer(data.answer);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setAnswer(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const qs = new URLSearchParams({ q: searchQuery, limit: '20' });
      const res = await fetch(`${API_URL}/search?${qs.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dlm_token') || ''}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSearchResults(data);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Docker Log Summaries</h1>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Container</th>
            <th className="p-2 border">Start</th>
            <th className="p-2 border">End</th>
            <th className="p-2 border">Summary</th>
            <th className="p-2 border">Cost (USD)</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((s) => (
            <tr key={s.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="p-2 border text-right">{s.id}</td>
              <td className="p-2 border">{s.container}</td>
              <td className="p-2 border">{new Date(s.ts_start).toLocaleString()}</td>
              <td className="p-2 border">{new Date(s.ts_end).toLocaleString()}</td>
              <td className="p-2 border">
                <pre className="whitespace-pre-wrap text-xs max-h-40 overflow-auto">{JSON.stringify(JSON.parse(s.summary), null, 2)}</pre>
              </td>
              <td className="p-2 border text-right">{s.cost_usd.toFixed(6)}</td>
            </tr>
          ))}
          {summaries.length === 0 && (
            <tr><td colSpan={6} className="p-4 text-center">No summaries yet</td></tr>
          )}
        </tbody>
      </table>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Search summaries</h2>
        <div className="flex gap-2">
          <input className="flex-1 border p-2 rounded-md" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Search..." />
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md" onClick={handleSearch}>Search</button>
        </div>
        {searchResults.length > 0 && (
          <table className="w-full text-sm border mt-4">
            <thead><tr><th className="p-2 border">Summary ID</th><th className="p-2 border">Score</th></tr></thead>
            <tbody>{searchResults.map(r=> (<tr key={r.id}><td className="p-2 border">{r.id}</td><td className="p-2 border">{r.score.toFixed(3)}</td></tr>))}</tbody>
          </table>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Ask a question</h2>
        <textarea
          className="w-full p-2 border rounded-md"
          rows={3}
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          className={cn('px-4 py-2 text-white rounded-md', loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700')}
          disabled={loading}
          onClick={handleAsk}
        >
          {loading ? 'Asking...' : 'Ask'}
        </button>
        {answer && (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
            <h3 className="font-medium mb-2">Answer</h3>
            <p>{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
} 