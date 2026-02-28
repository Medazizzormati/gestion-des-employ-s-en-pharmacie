'use client';

import { usePendingAbsences, useApproveAbsence, useRefuseAbsence, useEmployees } from '@/hooks/useHRAgent';
import { Clock, Check, X, Calendar, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_LABELS: Record<string, string> = {
  vacation: 'Congé payé',
  sick_leave: 'Arrêt maladie',
  personal_leave: 'Congé personnel',
  unpaid_leave: 'Congé non rémunéré',
  other: 'Autre',
};

const TYPE_COLORS: Record<string, string> = {
  vacation: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  sick_leave: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  personal_leave: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  unpaid_leave: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  other: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

function AbsenceCard({ absence, onSelect, colorClass, baseColor }: { absence: any; onSelect: () => void; colorClass: string; baseColor: string }) {
  const typeStyle = TYPE_COLORS[absence.absence_type] || TYPE_COLORS.other;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onSelect}
      className={`relative p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group overflow-hidden`}
      style={{ borderLeftColor: baseColor, borderLeftWidth: '3px' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${typeStyle}`}>
            {absence.employee_name?.charAt(0) || '?'}
          </div>
          <p className="font-semibold text-sm text-slate-200">{absence.employee_name}</p>
        </div>
        <span className={`px-2.5 py-1 text-[11px] font-semibold border rounded-full ${typeStyle}`}>
          {TYPE_LABELS[absence.absence_type] || absence.absence_type}
        </span>
      </div>

      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium relative z-10">
        <Calendar size={13} className="text-slate-500" />
        <span>{new Date(absence.start_date).toLocaleDateString('fr-FR')} → {new Date(absence.end_date).toLocaleDateString('fr-FR')}</span>
        <span className="text-slate-500">({absence.days_count}j)</span>
      </div>

      {absence.reason && (
        <p className="text-xs text-slate-400 mt-3 p-2 bg-black/20 rounded-lg relative z-10 border border-white/5">
          {absence.reason}
        </p>
      )}
    </motion.div>
  );
}

export default function AbsencesPage() {
  const { data: absencesData, isLoading, refetch } = usePendingAbsences();
  const { mutate: approveAbsence } = useApproveAbsence();
  const { mutate: refuseAbsence } = useRefuseAbsence();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const absences = (absencesData as any)?.absences || [];

  const pending = absences.filter((a: any) => a.status === 'pending');
  const approved = absences.filter((a: any) => a.status === 'approved');
  const refused = absences.filter((a: any) => a.status === 'refused');

  const handleApprove = (id: number) => {
    approveAbsence({ absenceId: id, note } as any, { onSuccess: () => { setSelected(null); setNote(''); refetch(); } });
  };

  const handleRefuse = (id: number) => {
    refuseAbsence({ absenceId: id, reason: note } as any, { onSuccess: () => { setSelected(null); setNote(''); refetch(); } });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-[50vh] text-slate-400">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-sm font-medium animate-pulse">Chargement des absences...</p>
      </div>
    </div>
  );

  const columns = [
    { title: 'En attente', icon: Clock, baseColor: '#f59e0b', colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20', items: pending },
    { title: 'Approuvées', icon: Check, baseColor: '#22c55e', colorClass: 'text-green-500 bg-green-500/10 border-green-500/20', items: approved },
    { title: 'Refusées', icon: X, baseColor: '#f43f5e', colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20', items: refused },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
          Gestion des Absences
        </h1>
        <p className="text-slate-400 text-sm font-medium">Kanban de suivi des demandes de congé de votre équipe</p>
      </motion.div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(({ title, colorClass, items, icon: Icon }, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={title}
            className={`p-4 rounded-2xl flex items-center justify-between border ${colorClass} backdrop-blur-sm`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Icon size={18} />
              </div>
              <span className="font-semibold">{title}</span>
            </div>
            <span className="text-2xl font-black">{items.length}</span>
          </motion.div>
        ))}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map(({ title, icon: Icon, colorClass, baseColor, items }) => (
          <div key={title} className="flex flex-col gap-4 bg-[#0A0D14] p-4 rounded-3xl border border-white/5 shadow-2xl">
            <div className={`p-3 rounded-xl flex items-center justify-between border ${colorClass}`}>
              <div className="flex items-center gap-2">
                <Icon size={16} />
                <span className="font-bold text-sm tracking-wide uppercase">{title}</span>
              </div>
              <span className="font-bold px-2 py-0.5 bg-background/50 rounded-md text-sm">{items.length}</span>
            </div>

            <div className="flex flex-col gap-3 min-h-[300px]">
              <AnimatePresence>
                {items.map((a: any) => (
                  <AbsenceCard
                    key={a.id}
                    absence={a}
                    colorClass={colorClass}
                    baseColor={baseColor}
                    onSelect={() => title === 'En attente' ? setSelected(String(a.id)) : undefined}
                  />
                ))}
              </AnimatePresence>

              {items.length === 0 && (
                <div className="h-full flex items-center justify-center p-8 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                  <p className="text-slate-500 text-sm font-medium">Aucune demande</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action panel (Modal) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#0d1117] border border-sky-500/30 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-indigo-500" />

              <h2 className="text-xl font-bold text-slate-100 mb-2">Traitement de la demande</h2>
              <p className="text-sm text-slate-400 mb-6 font-medium">Ajoutez une note optionnelle pour justifier votre décision avant de valider ou refuser.</p>

              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Note globale pour l'employé (optionnel)…"
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all mb-6 resize-none placeholder:text-slate-600"
              />

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleApprove(parseInt(selected))}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl font-semibold text-sm transition-all"
                >
                  <Check size={18} /> Approuver
                </button>
                <button
                  onClick={() => handleRefuse(parseInt(selected))}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl font-semibold text-sm transition-all"
                >
                  <X size={18} /> Refuser
                </button>
                <button
                  onClick={() => { setSelected(null); setNote(''); }}
                  className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl font-semibold text-sm transition-all"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
