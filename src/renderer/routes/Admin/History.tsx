import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

const History: React.FC = () => {
  const { sessions, loadSessions } = useStore();
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    return session.paymentStatus === filter;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Created At', 'Package', 'Status', 'Payment Method', 'Amount', 'Photos', 'Prints'];
    const rows = filteredSessions.map(s => [
      s.id,
      new Date(s.createdAt).toISOString(),
      s.packageId,
      s.paymentStatus,
      s.paymentMethod || '-',
      s.amount?.toString() || '0',
      s.photoCount.toString(),
      s.printCount.toString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photobooth-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Rp 0';
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-bold">Transaction History</h2>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-gray-700 rounded-xl"
          >
            <option value="all">All Sessions</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <button
            onClick={exportCSV}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-xl font-semibold"
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => loadSessions(100)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-sm text-gray-400">Total Sessions</div>
          <div className="text-3xl font-bold">{sessions.length}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-sm text-gray-400">Paid Sessions</div>
          <div className="text-3xl font-bold text-green-400">
            {sessions.filter(s => s.paymentStatus === 'paid').length}
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-sm text-gray-400">Total Revenue</div>
          <div className="text-3xl font-bold text-primary-400">
            Rp {sessions
              .filter(s => s.paymentStatus === 'paid')
              .reduce((sum, s) => sum + (s.amount || 0), 0)
              .toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Sessions table */}
      <div className="bg-gray-800 rounded-2xl overflow-hidden">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No sessions found matching filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm text-gray-400">ID</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-400">Date/Time</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-400">Package</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-400">Status</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-400">Amount</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-400">Photos</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-400">Prints</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="border-t border-gray-700/50 hover:bg-gray-700/30">
                    <td className="px-6 py-4 font-mono text-sm">
                      {session.id.slice(0, 12)}...
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatDate(session.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {session.packageId}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          session.paymentStatus === 'paid'
                            ? 'bg-green-500/20 text-green-400'
                            : session.paymentStatus === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {session.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {formatCurrency(session.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {session.photoCount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {session.printCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
