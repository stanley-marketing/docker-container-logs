"use client";
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Summary {
  id: number;
  chunk_id: number;
  container: string;
  ts_start: string;
  ts_end: string;
  summary: string;
  cost_usd: number;
  created_at: string;
}

function parseWhat(summary: string) {
  try {
    const obj = JSON.parse(summary);
    return obj.what_happened || summary.slice(0, 120);
  } catch {
    return summary.slice(0, 120);
  }
}

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [selected, setSelected] = useState<Summary | null>(null);

  const fetchSummaries = async () => {
    try {
      const res = await fetch(`${API_URL}/summaries?limit=100`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('dlm_token') || ''}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSummaries(data);
    } catch (err) {
      console.error('Failed to load summaries', err);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  return (
    <section>
      <div className="relative border rounded-md shadow-sm overflow-x-auto max-h-[70vh]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
            <tr>
              <th className="p-2 border-b w-16 text-right">ID</th>
              <th className="p-2 border-b">Container</th>
              <th className="p-2 border-b">Time</th>
              <th className="p-2 border-b">What happened</th>
              <th className="p-2 border-b w-24 text-right">Cost</th>
              <th className="p-2 border-b w-20"> </th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-2 border-b text-right font-mono">{s.id}</td>
                <td className="p-2 border-b truncate max-w-[200px]" title={s.container}>
                  {s.container.split('/').pop()}
                </td>
                <td className="p-2 border-b text-xs whitespace-nowrap">
                  <div>{new Date(s.ts_start).toLocaleTimeString()}</div>
                  <div className="text-gray-500 text-[10px]">{new Date(s.ts_start).toLocaleDateString()}</div>
                </td>
                <td className="p-2 border-b max-w-[400px] truncate" title={parseWhat(s.summary)}>
                  {parseWhat(s.summary)}
                </td>
                <td className="p-2 border-b text-right">{s.cost_usd.toFixed(6)}</td>
                <td className="p-2 border-b text-center">
                  <button className="text-blue-600 hover:underline" onClick={() => setSelected(s)}>
                    Open
                  </button>
                </td>
              </tr>
            ))}
            {summaries.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No summaries yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)}></div>
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg max-w-3xl w-full mx-4 overflow-y-auto max-h-[90vh] space-y-4 shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-2">Chunk #{selected.id}</h2>
            <pre className="text-xs whitespace-pre-wrap bg-gray-100 dark:bg-gray-900 p-4 rounded-md">
              {JSON.stringify(JSON.parse(selected.summary), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
} 