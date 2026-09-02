import React, { useState, useMemo } from 'react';
import { StorageService } from '../../services/storageService';
import { Subscriber } from '../../types';
import { 
  Users, 
  Search, 
  Download, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2, 
  RefreshCw,
  Filter,
  UserCheck,
  UserX
} from 'lucide-react';

export const AdminSubscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => StorageService.getSubscribers());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Unsubscribed' | 'Verified'>('All');
  const [toastMsg, setToastMsg] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const reloadSubscribers = () => {
    setSubscribers(StorageService.getSubscribers());
  };

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(sub => {
      const matchesSearch = sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            sub.id.toLowerCase().includes(searchQuery.toLowerCase());
      if (statusFilter === 'All') return matchesSearch;
      if (statusFilter === 'Active') return matchesSearch && sub.status === 'Active';
      if (statusFilter === 'Unsubscribed') return matchesSearch && sub.status === 'Unsubscribed';
      if (statusFilter === 'Verified') return matchesSearch && sub.verificationStatus === 'Verified';
      return matchesSearch;
    });
  }, [subscribers, searchQuery, statusFilter]);

  const handleToggleStatus = (sub: Subscriber) => {
    const newStatus = sub.status === 'Active' ? 'Unsubscribed' : 'Active';
    StorageService.updateSubscriberStatus(sub.id, newStatus);
    showToast(`Subscriber ${sub.email} status set to ${newStatus}`);
    reloadSubscribers();
  };

  const handleDelete = (id: string, email: string) => {
    if (confirm(`Are you sure you want to remove subscriber ${email}?`)) {
      StorageService.deleteSubscriber(id);
      showToast(`Subscriber ${email} removed.`);
      reloadSubscribers();
    }
  };

  const handleExportCSV = () => {
    if (filteredSubscribers.length === 0) {
      alert('No subscribers to export.');
      return;
    }

    const headers = ['Subscriber ID', 'Email Address', 'Subscription Date', 'Verification Status', 'Status', 'Last Email Sent Date'];
    const rows = filteredSubscribers.map(sub => [
      `"${sub.id}"`,
      `"${sub.email}"`,
      `"${new Date(sub.subscriptionDate).toLocaleString('en-IN')}"`,
      `"${sub.verificationStatus}"`,
      `"${sub.status}"`,
      `"${sub.lastEmailSentDate ? new Date(sub.lastEmailSentDate).toLocaleString('en-IN') : 'Never'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `the_stoce_times_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported subscribers CSV successfully!');
  };

  const activeCount = subscribers.filter(s => s.status === 'Active').length;
  const unsubCount = subscribers.filter(s => s.status === 'Unsubscribed').length;
  const verifiedCount = subscribers.filter(s => s.verificationStatus === 'Verified').length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header & Stats Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B1F33] tracking-tight font-serif flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#155EEF]" />
            <span>Newsletter Subscribers Management</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-light">
            Monitor, manage, search, and export audience members subscribed to The Stoce Times editorial broadcasts.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Subscriber List (CSV)</span>
        </button>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Subscribers</span>
          <div className="text-2xl font-black text-[#0B1F33] font-mono">{subscribers.length}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Active Audience</span>
          <div className="text-2xl font-black text-emerald-600 font-mono">{activeCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Verified Email IDs</span>
          <div className="text-2xl font-black text-blue-600 font-mono">{verifiedCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Unsubscribed</span>
          <div className="text-2xl font-black text-rose-600 font-mono">{unsubCount}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Email ID or Subscriber ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(['All', 'Active', 'Verified', 'Unsubscribed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#0B1F33] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Subscribers Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="p-4">Subscriber ID</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Subscription Date</th>
                <th className="p-4">Verification Status</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Last Email Sent</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    No subscribers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => {
                  const subDate = new Date(sub.subscriptionDate).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const lastSent = sub.lastEmailSentDate
                    ? new Date(sub.lastEmailSentDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'Never';

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-500">
                        {sub.id}
                      </td>

                      <td className="p-4 font-bold text-[#0B1F33]">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{sub.email}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 font-mono">
                        {subDate}
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                          sub.verificationStatus === 'Verified'
                            ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {sub.verificationStatus === 'Verified' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{sub.verificationStatus}</span>
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                          sub.status === 'Active'
                            ? 'bg-blue-50 text-[#155EEF] border-blue-200'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}>
                          {sub.status === 'Active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          <span>{sub.status}</span>
                        </span>
                      </td>

                      <td className="p-4 text-slate-500 font-mono">
                        {lastSent}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleStatus(sub)}
                          title={sub.status === 'Active' ? 'Deactivate / Unsubscribe' : 'Reactivate Subscriber'}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            sub.status === 'Active'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-50 text-[#16A34A] border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {sub.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleDelete(sub.id, sub.email)}
                          title="Delete Subscriber"
                          className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
