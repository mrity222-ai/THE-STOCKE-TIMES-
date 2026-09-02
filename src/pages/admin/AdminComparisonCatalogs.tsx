import React, { useState } from 'react';
import { ComparisonCatalogService } from '../../services/comparisonCatalogService';
import { CreditCardItem, MutualFundItem } from '../../types/comparisons';
import { 
  CreditCard, 
  BarChart3, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  Layers
} from 'lucide-react';

export const AdminComparisonCatalogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cards' | 'funds'>('cards');
  const [cards, setCards] = useState<CreditCardItem[]>(ComparisonCatalogService.getCreditCards());
  const [funds, setFunds] = useState<MutualFundItem[]>(ComparisonCatalogService.getMutualFunds());

  const [toastMsg, setToastMsg] = useState('');
  const [editingCard, setEditingCard] = useState<Partial<CreditCardItem> | null>(null);
  const [editingFund, setEditingFund] = useState<Partial<MutualFundItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshData = () => {
    setCards(ComparisonCatalogService.getCreditCards());
    setFunds(ComparisonCatalogService.getMutualFunds());
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard || !editingCard.name) return;
    ComparisonCatalogService.saveCreditCard(editingCard as any);
    refreshData();
    setIsModalOpen(false);
    showToast('Credit Card saved to catalog.');
  };

  const handleSaveFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFund || !editingFund.name) return;
    ComparisonCatalogService.saveMutualFund(editingFund as any);
    refreshData();
    setIsModalOpen(false);
    showToast('Mutual Fund saved to catalog.');
  };

  const handleDeleteCard = (id: string) => {
    if (window.confirm('Delete credit card from comparison catalog?')) {
      ComparisonCatalogService.deleteCreditCard(id);
      refreshData();
      showToast('Credit Card deleted.');
    }
  };

  const handleDeleteFund = (id: string) => {
    if (window.confirm('Delete mutual fund from comparison catalog?')) {
      ComparisonCatalogService.deleteMutualFund(id);
      refreshData();
      showToast('Mutual Fund deleted.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Product Catalogs Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage Credit Cards and Mutual Funds datasets used by comparison tools.</p>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'cards') {
              setEditingCard({ name: '', issuer: '', joiningFee: 0, annualFee: 0, rewardRatePct: 2, loungeAccessAnnual: 4, categoryBestFor: 'Rewards', status: 'active' });
              setEditingFund(null);
            } else {
              setEditingFund({ name: '', amc: '', category: 'Equity', nav: 50, aumCr: 10000, expenseRatioPct: 0.75, return5Y: 15, status: 'active' });
              setEditingCard(null);
            }
            setIsModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-2 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add {activeTab === 'cards' ? 'Credit Card' : 'Mutual Fund'}</span>
        </button>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-500 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1 text-xs font-bold w-fit">
        <button
          onClick={() => setActiveTab('cards')}
          className={`px-5 py-2 rounded-xl transition-all ${activeTab === 'cards' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          💳 Credit Cards Catalog ({cards.length})
        </button>
        <button
          onClick={() => setActiveTab('funds')}
          className={`px-5 py-2 rounded-xl transition-all ${activeTab === 'funds' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          📈 Mutual Funds Catalog ({funds.length})
        </button>
      </div>

      {/* Cards Catalog Grid */}
      {activeTab === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-base">{card.name}</span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded border border-emerald-200">
                    {card.categoryBestFor}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500 block">{card.issuer}</span>
                <div className="text-xs space-y-1 pt-2 border-t font-mono">
                  <div className="flex justify-between"><span>Annual Fee:</span><strong>₹{card.annualFee}</strong></div>
                  <div className="flex justify-between"><span>Lounge Access:</span><strong>{card.loungeAccessAnnual} Visits/yr</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => { setEditingCard({ ...card }); setEditingFund(null); setIsModalOpen(true); }} className="px-3 py-1.5 bg-slate-100 font-bold text-xs rounded-xl hover:bg-emerald-600 hover:text-white">Edit</button>
                <button onClick={() => handleDeleteCard(card.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Funds Catalog Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funds.map((fund) => (
            <div key={fund.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-base line-clamp-1">{fund.name}</span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    {fund.category}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500 block">{fund.amc}</span>
                <div className="text-xs space-y-1 pt-2 border-t font-mono">
                  <div className="flex justify-between"><span>Expense Ratio:</span><strong className="text-emerald-600">{fund.expenseRatioPct}%</strong></div>
                  <div className="flex justify-between"><span>5Y CAGR Return:</span><strong className="text-emerald-600">{fund.return5Y}%</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => { setEditingFund({ ...fund }); setEditingCard(null); setIsModalOpen(true); }} className="px-3 py-1.5 bg-slate-100 font-bold text-xs rounded-xl hover:bg-emerald-600 hover:text-white">Edit</button>
                <button onClick={() => handleDeleteFund(fund.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Catalog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">{editingCard ? 'Credit Card Details' : 'Mutual Fund Details'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            {editingCard ? (
              <form onSubmit={handleSaveCard} className="space-y-3">
                <div><label className="font-bold">Card Name *</label><input type="text" required value={editingCard.name || ''} onChange={(e) => setEditingCard({ ...editingCard, name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300" /></div>
                <div><label className="font-bold">Issuer Bank *</label><input type="text" required value={editingCard.issuer || ''} onChange={(e) => setEditingCard({ ...editingCard, issuer: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300" /></div>
                <div><label className="font-bold">Annual Fee (₹)</label><input type="number" value={editingCard.annualFee || 0} onChange={(e) => setEditingCard({ ...editingCard, annualFee: Number(e.target.value) })} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono" /></div>
                <div className="flex justify-end gap-2 pt-2 border-t"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border font-bold">Cancel</button><button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold">Save Card</button></div>
              </form>
            ) : editingFund ? (
              <form onSubmit={handleSaveFund} className="space-y-3">
                <div><label className="font-bold">Fund Name *</label><input type="text" required value={editingFund.name || ''} onChange={(e) => setEditingFund({ ...editingFund, name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300" /></div>
                <div><label className="font-bold">AMC *</label><input type="text" required value={editingFund.amc || ''} onChange={(e) => setEditingFund({ ...editingFund, amc: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300" /></div>
                <div><label className="font-bold">5Y Return (%)</label><input type="number" step="0.1" value={editingFund.return5Y || 15} onChange={(e) => setEditingFund({ ...editingFund, return5Y: Number(e.target.value) })} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono" /></div>
                <div className="flex justify-end gap-2 pt-2 border-t"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border font-bold">Cancel</button><button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold">Save Fund</button></div>
              </form>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
};
