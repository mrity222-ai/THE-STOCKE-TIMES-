import React, { useState } from 'react';
import { FinancialRulesService } from '../../services/financialRulesService';
import { FinancialRulesConfig, IncomeTaxRules, PPFRules, EPFRules, NPSRules, GSTRules, RuleAuditLog } from '../../types/calculators';
import { 
  ShieldCheck, 
  Save, 
  Send, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  Calendar,
  Lock,
  Layers
} from 'lucide-react';

export const AdminFinancialRules: React.FC = () => {
  const [rules, setRules] = useState<FinancialRulesConfig>(FinancialRulesService.getRules());
  const [auditLogs, setAuditLogs] = useState<RuleAuditLog[]>(FinancialRulesService.getAuditLogs());
  const [activeTab, setActiveTab] = useState<'income-tax' | 'ppf' | 'epf' | 'nps' | 'gst' | 'audit'>('income-tax');
  const [selectedFy, setSelectedFy] = useState<string>('2026-27');
  const [toastMsg, setToastMsg] = useState('');

  const refreshRules = () => {
    setRules(FinancialRulesService.getRules());
    setAuditLogs(FinancialRulesService.getAuditLogs());
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleSaveDraft = () => {
    FinancialRulesService.saveRules(rules);
    showToast('Financial rules saved as draft.');
  };

  const handlePublishRules = (ruleName: string, oldValue: string, newValue: string) => {
    if (window.confirm(`Publishing this rule will change calculation results for all website visitors. Confirm publication?`)) {
      FinancialRulesService.saveRules(rules);
      FinancialRulesService.addAuditLog({
        ruleType: ruleName,
        financialYear: selectedFy,
        oldValue,
        newValue,
        updatedBy: 'Admin (Publish)',
        status: 'published'
      });
      refreshRules();
      showToast(`${ruleName} rules published live to website!`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Financial Rules & Government Rates System</h2>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
              Centralized Config
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Manage tax slabs, PPF rates, EPF interest rates, and GST rules without touching code.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2.5 rounded-xl border border-slate-300 font-extrabold text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-500 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1 text-xs font-bold">
        {(['income-tax', 'ppf', 'epf', 'nps', 'gst', 'audit'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl transition-all uppercase ${
              activeTab === tab ? 'bg-slate-900 text-white shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Tab 1: Income Tax Rules Configurator */}
      {activeTab === 'income-tax' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Income Tax Slabs & Deductions Editor</h3>
              <p className="text-xs text-slate-500">Configure Old and New Tax Regime slabs and rebate parameters per Financial Year.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Financial Year:</span>
              <select
                value={selectedFy}
                onChange={(e) => setSelectedFy(e.target.value)}
                className="bg-slate-100 border border-slate-300 font-bold text-slate-900 rounded-xl px-3 py-1.5 text-xs"
              >
                <option value="2026-27">FY 2026-27 (Current)</option>
                <option value="2025-26">FY 2025-26</option>
              </select>
            </div>
          </div>

          {/* New Tax Regime Config */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 w-fit">
              New Tax Regime (FY {selectedFy})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
              <div>
                <label className="text-slate-700 block mb-1">Standard Deduction (₹)</label>
                <input
                  type="number"
                  value={rules.incomeTax[selectedFy]?.newRegime.standardDeduction || 75000}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = { ...rules };
                    if (updated.incomeTax[selectedFy]) {
                      updated.incomeTax[selectedFy].newRegime.standardDeduction = val;
                      setRules(updated);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Rebate 87A Income Limit (₹)</label>
                <input
                  type="number"
                  value={rules.incomeTax[selectedFy]?.newRegime.rebateLimit || 700000}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = { ...rules };
                    if (updated.incomeTax[selectedFy]) {
                      updated.incomeTax[selectedFy].newRegime.rebateLimit = val;
                      setRules(updated);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Health & Cess Rate (%)</label>
                <input
                  type="number"
                  value={rules.incomeTax[selectedFy]?.newRegime.cessRate || 4}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = { ...rules };
                    if (updated.incomeTax[selectedFy]) {
                      updated.incomeTax[selectedFy].newRegime.cessRate = val;
                      setRules(updated);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>
            </div>

            {/* Slabs Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Min Income (₹)</th>
                    <th className="p-3">Max Income (₹)</th>
                    <th className="p-3">Tax Rate (%)</th>
                    <th className="p-3">Fixed Tax (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {(rules.incomeTax[selectedFy]?.newRegime.slabs || []).map((slab, idx) => (
                    <tr key={idx}>
                      <td className="p-3">₹{slab.minIncome.toLocaleString('en-IN')}</td>
                      <td className="p-3">{slab.maxIncome === -1 ? 'Above / No Limit' : `₹${slab.maxIncome.toLocaleString('en-IN')}`}</td>
                      <td className="p-3 font-bold text-emerald-600">{slab.rate}%</td>
                      <td className="p-3">₹{slab.fixedTax.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handlePublishRules('Income Tax (New Regime)', 'Previous Slabs', `FY ${selectedFy} Slabs Updated`)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Publish Tax Rules for FY {selectedFy}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PPF Rules Configurator */}
      {activeTab === 'ppf' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base border-b pb-3">PPF Interest Rate & Scheme Parameters</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-semibold max-w-2xl">
            <div>
              <label className="text-slate-700 block mb-1">Current PPF Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.05"
                value={rules.ppf.interestRate}
                onChange={(e) => setRules({ ...rules, ppf: { ...rules.ppf, interestRate: Number(e.target.value) } })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-emerald-600 text-sm"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1">Max Annual Limit (₹)</label>
              <input
                type="number"
                value={rules.ppf.maxAnnualContribution}
                onChange={(e) => setRules({ ...rules, ppf: { ...rules.ppf, maxAnnualContribution: Number(e.target.value) } })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1">Initial Lock-In (Years)</label>
              <input
                type="number"
                value={rules.ppf.lockInYears}
                onChange={(e) => setRules({ ...rules, ppf: { ...rules.ppf, lockInYears: Number(e.target.value) } })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => handlePublishRules('PPF Interest Rate', '7.1%', `${rules.ppf.interestRate}%`)}
              className="bg-emerald-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Publish PPF Rate Change
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: EPF Rules Configurator */}
      {activeTab === 'epf' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base border-b pb-3">EPF Interest Rate & Wage Rules</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-semibold max-w-2xl">
            <div>
              <label className="text-slate-700 block mb-1">EPF Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.05"
                value={rules.epf.interestRate}
                onChange={(e) => setRules({ ...rules, epf: { ...rules.epf, interestRate: Number(e.target.value) } })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-emerald-600 text-sm"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1">Employee Contribution (%)</label>
              <input
                type="number"
                value={rules.epf.employeeContributionPercent}
                onChange={(e) => setRules({ ...rules, epf: { ...rules.epf, employeeContributionPercent: Number(e.target.value) } })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1">Wage Ceiling Limit (₹)</label>
              <input
                type="number"
                value={rules.epf.wageCeiling}
                onChange={(e) => setRules({ ...rules, epf: { ...rules.epf, wageCeiling: Number(e.target.value) } })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => handlePublishRules('EPF Interest Rate', '8.15%', `${rules.epf.interestRate}%`)}
              className="bg-emerald-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Publish EPF Rate Change
            </button>
          </div>
        </div>
      )}

      {/* Tab: Audit Log History */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
          <h3 className="font-extrabold text-slate-900 text-sm border-b pb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" /> Rule Change History & Audit Logs
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="p-3">Rule Type</th>
                  <th className="p-3">Financial Year</th>
                  <th className="p-3">Old Value</th>
                  <th className="p-3">New Value</th>
                  <th className="p-3">Updated By</th>
                  <th className="p-3">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{log.ruleType}</td>
                    <td className="p-3">{log.financialYear || '-'}</td>
                    <td className="p-3 text-rose-600">{log.oldValue}</td>
                    <td className="p-3 text-emerald-600 font-bold">{log.newValue}</td>
                    <td className="p-3 text-slate-600">{log.updatedBy}</td>
                    <td className="p-3 text-slate-400">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
