'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchHistory } from '@/lib/api';

export default function HistoryPage() {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setCategory(input), 3000);
    return () => clearTimeout(id);
  }, [input]);

  const historyQuery = useQuery({
    queryKey: ['history', category],
    queryFn: () => fetchHistory(category || undefined),
  });

  function formatDate(strDate: string) {
    const d = new Date(strDate);
    const pad = (n: number) => String(n).padStart(2, '0');

    return (
      `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ` +
      `${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  }

  const classifications = historyQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Classification history</h2>
      </div>

      <label className="flex max-w-sm flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Filter by category</span>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="billing | sales | support | unknown"
        />
      </label>

      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
        {historyQuery.isLoading ? (
          <p>Loading…</p>
        ) : historyQuery.isError ? (
          <p className="text-red-700">Failed to load history.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-center">Created At</th>
                <th className="px-4 py-3 text-center">Message</th>
                <th className="px-4 py-3 text-center">Category</th>
                <th className="px-4 py-3 text-center">Confidence</th>
                <th className="px-4 py-3 text-center">Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classifications.slice(0, 25).map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-center">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="px-4 py-3">{row.request.message}</td>
                  <td className="px-4 py-3">{row.category}</td>
                  <td className="px-4 py-3 text-right">
                    {row.confidence == null ? '-' : row.confidence.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">{row.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
