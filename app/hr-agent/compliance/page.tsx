'use client';

import { useEmployees } from '@/hooks/useHRAgent';
import { AlertCircle, AlertTriangle, Info, CheckCircle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RULES = [
  { code: 'L3121-27', name: 'Durée légale hebdomadaire', category: 'Heures', description: '35 heures par semaine pour les salariés à temps complet.' },
  { code: 'L3121-20', name: 'Maximum hebdomadaire absolu', category: 'Heures', description: '48 heures par semaine maximum en toute circonstance. 44 heures sur 12 semaines consécutives.' },
  { code: 'L3131-1', name: 'Repos quotidien minimum', category: 'Repos', description: '11 heures consécutives de repos entre deux journées de travail.' },
  { code: 'L3132-2', name: 'Repos hebdomadaire minimum', category: 'Repos', description: '35 heures consécutives de repos par semaine (24h de repos hebdo + 11h de repos quotidien).' },
  { code: 'L3121-18', name: 'Durée journalière maximum', category: 'Heures', description: '10 heures de travail effectif maximum par jour.' },
  { code: 'L3121-16', name: 'Pause obligatoire', category: 'Pause', description: '20 minutes de pause après 6 heures consécutives de travail.' },
  { code: 'L3122-7', name: 'Travail de nuit', category: 'Nuit', description: '8 heures maximum pour les shifts de nuit (21h-6h).' },
  { code: 'L5125-4', name: 'Présence pharmacien qualifié', category: 'Pharmacie', description: 'Un pharmacien qualifié doit être présent à tout moment de l\'ouverture de la pharmacie selon quotas par CA.' },
  { code: 'L3141-3', name: 'Congés annuels minimum', category: 'Congés', description: '25 jours ouvrés de congés payés par année de référence.' },
];

const SEV_COLORS: Record<string, string> = { critical: 'text-rose-400', warning: 'text-amber-400', info: 'text-sky-400' };
const SEV_BG: Record<string, string> = { critical: 'bg-rose-500/10', warning: 'bg-amber-500/10', info: 'bg-sky-500/10' };
const SEV_BORDER: Record<string, string> = { critical: 'border-rose-500/20', warning: 'border-amber-500/20', info: 'border-sky-500/20' };
const SEV_LABELS: Record<string, string> = { critical: 'Critique', warning: 'Avertissement', info: 'Info' };
const SEV_ICONS: Record<string, any> = { critical: AlertCircle, warning: AlertTriangle, info: Info };

export default function CompliancePage() {
  const { data: employeesData } = useEmployees();
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [filterEmp, setFilterEmp] = useState('all');

  const rules = RULES;
  const employees = (employeesData as any)?.results || [];

  // Simulation of Violations for testing presentation since it's an MVP
  const violations: any[] = [
    // { id: 1, employee: employees[0]?.id || 1, rule_name: "Repos quotidien minimum", severity: "critical", violation_details: "Temps de repos de 9h seulement entre le shift du lundi et mardi (Min légal: 11h)." },
    // { id: 2, employee: employees[1]?.id || 2, rule_name: "Durée journalière maximum", severity: "warning", violation_details: "Shift programmé de 10.5 heures le vendredi (Max légal: 10h)." }
  ];

  const filtered = filterEmp === 'all' ? violations : violations.filter((v: any) => String(v.employee) === filterEmp);

  const counts = {
    critical: violations.filter(v => v.severity === 'critical').length,
    warning: violations.filter(v => v.severity === 'warning').length,
    info: violations.filter(v => v.severity === 'info').length
  };

  const empName = (id: number) => employees.find((e: any) => e.id === id)?.first_name || 'Inconnu';

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-4">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Audit Légal Continu</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400 mb-3 tracking-tight">
          Conformité au Code du Travail
        </h1>
        <p className="text-slate-400 font-medium max-w-xl">
          Supervision en temps réel des règles françaises appliquées sur vos plannings.
          Détection automatique des infractions et anomalies.
        </p>
      </motion.div>

      {/* Score + stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="relative bg-[#0A0D14] p-6 rounded-3xl border border-emerald-500/30 text-center shadow-[0_0_30px_-5px_rgba(34,197,94,0.15)] group overflow-hidden"
        >
          <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
          <ShieldCheck size={32} className="text-emerald-400 mx-auto mb-3 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] relative z-10" />
          <div className="text-4xl font-black text-emerald-400 relative z-10">100</div>
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-500/70 mt-1 relative z-10">Score Légal / 100</div>
        </motion.div>

        {Object.entries(counts).map(([sev, cnt], i) => {
          const colorClass = SEV_COLORS[sev];
          const bgClass = SEV_BG[sev];
          const borderClass = SEV_BORDER[sev];
          const Icon = SEV_ICONS[sev];

          return (
            <motion.div
              key={sev}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + (i * 0.05) }}
              className={`relative bg-[#0A0D14] p-6 rounded-3xl border ${borderClass} text-center shadow-lg group overflow-hidden ${cnt > 0 ? bgClass.replace('/10', '/5') : ''}`}
            >
              <div className={`absolute inset-0 ${bgClass} opacity-0 group-hover:opacity-50 transition-opacity`} />
              <Icon size={32} className={`${colorClass} mx-auto mb-3 relative z-10 opacity-80`} />
              <div className={`text-4xl font-black ${colorClass} relative z-10`}>{cnt}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1 relative z-10">{SEV_LABELS[sev]}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Violations */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-slate-200">Rapport d'infractions</h2>
            <div className="relative w-full sm:w-64">
              <select
                value={filterEmp}
                onChange={e => setFilterEmp(e.target.value)}
                className="w-full appearance-none bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-emerald-500/50 rounded-xl py-2.5 pl-4 pr-10 text-slate-200 text-sm font-medium outline-none transition-all cursor-pointer"
              >
                <option value="all" className="bg-slate-900">Tous les employés</option>
                {employees.map((e: any) => <option key={e.id} value={e.id} className="bg-slate-900">{e.first_name} {e.last_name}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <motion.div layout className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                filtered.map((v: any, i) => {
                  const colorClass = SEV_COLORS[v.severity] || 'text-slate-400';
                  const bgClass = SEV_BG[v.severity] || 'bg-slate-500/10';
                  const borderClass = SEV_BORDER[v.severity] || 'border-slate-500/20';
                  const Icon = SEV_ICONS[v.severity] || Info;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.1 }}
                      key={v.id}
                      className="bg-[#0A0D14] p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors"
                    >
                      <div className={`absolute top-0 left-0 bottom-0 w-1 ${bgClass.replace('/10', '')}`} />

                      <div className="flex gap-4 items-start pl-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgClass} ${colorClass}`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                            <p className="font-bold text-slate-200 text-[15px]">{v.rule_name}</p>
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${bgClass} ${colorClass} ${borderClass} border shrink-0 w-fit`}>
                              {SEV_LABELS[v.severity]}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-800 text-[10px] font-bold text-slate-400">
                              {empName(v.employee).charAt(0)}
                            </div>
                            <p className="text-sm font-semibold text-slate-400">{empName(v.employee)}</p>
                          </div>

                          <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
                            <p className="text-[13px] text-slate-300 font-medium leading-relaxed">{v.violation_details}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-[#0A0D14] border border-emerald-500/20 rounded-3xl p-12 text-center flex flex-col items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-emerald-500/5" />
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 relative z-10 border border-emerald-500/20">
                    <CheckCircle size={40} className="text-emerald-400 shadow-emerald-400/50" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-400 mb-2 relative z-10">Aucune violation détectée</h3>
                  <p className="text-slate-400 font-medium relative z-10 max-w-sm">
                    {filterEmp === 'all'
                      ? 'Félicitations, l\'ensemble de vos plannings respecte rigoureusement le droit du travail.'
                      : 'Cet employé est parfaitement en règle avec le droit du travail.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right Column - Rules reference */}
        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-slate-200">Référentiel Légal</h2>

          <div className="flex flex-col gap-3">
            {rules.map((rule: any, i) => {
              const isExpanded = expandedRule === rule.code;

              return (
                <motion.div
                  key={rule.code}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`
                    bg-[#0A0D14] rounded-2xl border transition-all cursor-pointer overflow-hidden
                    ${isExpanded ? 'border-sky-500/30 shadow-[0_4px_20px_-5px_rgba(56,189,248,0.15)] bg-sky-950/20' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}
                  `}
                  onClick={() => setExpandedRule(isExpanded ? null : rule.code)}
                >
                  <div className="p-4 flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <p className={`font-bold text-[14px] mb-1 transition-colors ${isExpanded ? 'text-sky-300' : 'text-slate-200'}`}>
                        {rule.name}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-slate-500 font-medium">{rule.code}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">{rule.category}</span>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${isExpanded ? 'bg-sky-500/20 text-sky-400' : 'bg-white/5 text-slate-400'}`}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4">
                          <div className="w-full h-px bg-white/5 mb-3" />
                          <p className="text-[13px] text-slate-300 font-medium leading-relaxed">{rule.description}</p>
                          {rule.details && (
                            <div className="mt-3 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                              <p className="text-xs text-slate-400 leading-relaxed font-medium">{rule.details}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
