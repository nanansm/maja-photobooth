import React from 'react';
import { useStore } from '../../store/useStore';

const Dashboard: React.FC = () => {
  const { stats, sessions, packages } = useStore();

  const recentSessions = sessions.slice(0, 10);

  const totalRevenue = stats?.revenue || 0;
  const totalPrints = stats?.prints || 0;
  const totalSessions = stats?.total || 0;

  const todayStats = async () => {
    // For demo, just show current stats (today)
    return stats;
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-display font-bold">Dashboard</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 border-l-4 border-primary-500">
          <div className="text-sm text-gray-400 mb-2">Total Revenue (Today)</div>
          <div className="text-4xl font-bold text-primary-400">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-400 mb-2">Sessions (Today)</div>
          <div className="text-4xl font-bold text-green-400">{totalSessions}</div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-400 mb-2">Prints (Today)</div>
          <div className="text-4xl font-bold text-blue-400">{totalPrints}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent sessions */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Recent Sessions</h3>
          {recentSessions.length === 0 ? (
            <p className="text-gray-400">No sessions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((session) => (
                    <tr key={session.id} className="border-b border-gray-700/50">
                      <td className="py-3 text-sm">{session.id.slice(0, 12)}...</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
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
                      <td className="py-3">
                        {session.amount ? `Rp ${session.amount.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="py-3 text-sm text-gray-400">
                        {new Date(session.createdAt).toLocaleTimeString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active packages */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Active Packages</h3>
          {packages.length === 0 ? (
            <p className="text-gray-400">No packages configured</p>
          ) : (
            <div className="space-y-4">
              {packages.slice(0, 5).map((pkg) => (
                <div key={pkg.id} className="flex justify-between items-center p-4 bg-gray-700/50 rounded-xl">
                  <div>
                    <div className="font-semibold">{pkg.name}</div>
                    <div className="text-sm text-gray-400">{pkg.photoCount} foto • {pkg.printCount} cetak</div>
                  </div>
                  <div className="text-xl font-bold text-primary-400">
                    Rp {pkg.price.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System info */}
      <div className="bg-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">System Info</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <div className="text-gray-400">Platform</div>
            <div className="font-semibold">{navigator.platform}</div>
          </div>
          <div>
            <div className="text-gray-400">Demo Mode</div>
            <div className="font-semibold">
              {useStore.getState().config.demoMode ? '✅ Enabled' : '❌ Disabled'}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Webhook Port</div>
            <div className="font-semibold">{useStore.getState().config.webhookPort}</div>
          </div>
          <div>
            <div className="text-gray-400">Payment Configured</div>
            <div className="font-semibold">
              {useStore.getState().config.xenditSecretKey ? '✅ Yes' : '❌ No'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
