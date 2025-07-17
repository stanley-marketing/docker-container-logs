"use client";
import { useState } from 'react';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: number; score: number }[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const qs = new URLSearchParams({ q: query, limit: '20' });
      const res = await fetch(`${API_URL}/search?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('dlm_token') || ''}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="max-w-lg space-y-4">
      <h2 className="text-xl font-semibold">Search summaries</h2>
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded-md"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" onClick={handleSearch}>
          Search
        </button>
      </div>
      {results.length > 0 && (
        <table className="w-full text-sm border mt-4">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 border">Summary ID</th>
              <th className="p-2 border">Score</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 border text-right font-mono">{r.id}</td>
                <td className="p-2 border">{r.score.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
} 