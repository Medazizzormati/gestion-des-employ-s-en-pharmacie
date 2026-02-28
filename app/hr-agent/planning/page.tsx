'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useShiftsThisWeek, useCreateShift, useEmployees } from '@/hooks/useHRAgent';
import { Calendar, Plus, AlertCircle, Clock, Save, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const HOURS = Array.from({ length: 13 }, (_, i) => `${8 + i}:00`);

export default function PlanningPage() {
  const { data: shiftsData, isLoading } = useShiftsThisWeek();
  const { data: employeesData } = useEmployees();
  const { mutate: createShift } = useCreateShift();
  const [showNewShift, setShowNewShift] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedStartHour, setSelectedStartHour] = useState<number>(0);

  const shifts = shiftsData?.shifts || [];
  const employees = employeesData?.results || [];

  const handleAddShift = () => {
    if (selectedEmployee && selectedDay !== null) {
      createShift({
        employee: parseInt(selectedEmployee),
        day_of_week: selectedDay,
        start_hour: selectedStartHour,
        duration_hours: 8,
      });
      setShowNewShift(false);
      setSelectedEmployee('');
    }
  };

  const getShiftsForDay = (dayIndex: number) => {
    return shifts.filter(shift => ((shift as any).day_of_week as number) === dayIndex || (shift as any).day === dayIndex);
  };

  const getEmployeeName = (empId: number) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? `${(emp as any).first_name || emp.name || 'Inconnu'}` : 'Inconnu';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
          <p className="text-sm font-medium animate-pulse">Chargement du planning...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
            Tableau de Planification
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Planifiez les horaires de votre équipe de manière intelligente
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button
            onClick={() => setShowNewShift(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all w-full md:w-auto justify-center"
          >
            <Plus size={18} />
            Ajouter un horaire
          </button>
        </motion.div>
      </div>

      {/* Add Shift Modal */}
      <AnimatePresence>
        {showNewShift && (
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
              className="w-full max-w-xl bg-[#0d1117] border border-sky-500/30 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-indigo-500" />

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-100">Nouvel horaire</h2>
                <button onClick={() => setShowNewShift(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Employé</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  >
                    <option value="" disabled>Sélectionner...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id} className="bg-[#0f172a]">
                        {(emp as any).first_name} {(emp as any).last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jour</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  >
                    {DAYS_OF_WEEK.map((day, idx) => (
                      <option key={idx} value={idx} className="bg-[#0f172a]">{day}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Début</label>
                  <select
                    value={selectedStartHour}
                    onChange={(e) => setSelectedStartHour(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  >
                    {HOURS.map((hour, idx) => (
                      <option key={idx} value={idx} className="bg-[#0f172a]">{hour}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Durée (h)</label>
                  <input
                    type="number"
                    value={8}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-400 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddShift}
                  disabled={!selectedEmployee}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all"
                >
                  <Save size={18} /> Planifier
                </button>
                <button
                  onClick={() => setShowNewShift(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl font-semibold text-sm transition-all"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Week View Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#0A0D14] rounded-3xl border border-white/5 shadow-2xl overflow-hidden"
      >
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px]">
            {/* Table Header */}
            <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] bg-white/[0.02] border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
              <div className="p-4 flex items-center justify-center border-r border-white/5">
                <Clock size={16} className="text-slate-500" />
              </div>
              {DAYS_OF_WEEK.map((day, idx) => (
                <div key={idx} className={`p-4 text-center border-r border-white/5 last:border-0 ${idx >= 5 ? 'bg-sky-500/5' : ''}`}>
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">{day}</span>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="relative">
              {HOURS.map((hour, hourIdx) => (
                <div key={hourIdx} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-white/5 last:border-0 group hover:bg-white/[0.01] transition-colors">

                  {/* Time column */}
                  <div className="p-3 border-r border-white/5 flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-500">{hour}</span>
                  </div>

                  {/* Day cells */}
                  {DAYS_OF_WEEK.map((_, dayIdx) => {
                    const cellShifts = getShiftsForDay(dayIdx).filter(
                      s => parseInt((s.start_time as string || "0").split(':')[0]) <= hourIdx + 8 && parseInt((s.start_time as string || "0").split(':')[0]) + parseFloat((s as any).duration_hours || s.duration_hours || 0) > hourIdx + 8
                    );

                    const isStart = cellShifts.some(s => parseInt((s.start_time as string || "0").split(':')[0]) === hourIdx + 8);

                    return (
                      <div key={`${dayIdx}-${hourIdx}`} className={`p-1.5 border-r border-white/5 last:border-0 min-h-[48px] ${dayIdx >= 5 ? 'bg-sky-500/5' : ''} relative`}>
                        {cellShifts.map(shift => {
                          const isNew = shift.generated_by_ai;
                          return (
                            <div
                              key={`${shift.id}-${hourIdx}`}
                              className={`
                                w-full rounded-md px-2 py-1 mb-1 text-[11px] font-semibold border truncate
                                ${isNew
                                  ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                                  : 'bg-sky-500/10 border-sky-500/20 text-sky-300'
                                }
                                ${parseInt((shift.start_time as string || "0").split(':')[0]) === hourIdx + 8 ? 'opacity-100' : 'opacity-60 border-t-transparent shadow-none'}
                              `}
                            >
                              {parseInt((shift.start_time as string || "0").split(':')[0]) === hourIdx + 8 ? getEmployeeName(shift.employee) : ''}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weekly Summary & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[#0A0D14] rounded-3xl border border-white/5 shadow-xl p-6 relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/5 rounded-xl text-sky-400">
              <Clock size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Résumé Hebdomadaire</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-slate-200 mb-1">{shifts.length}</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Horaires</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-sky-400 mb-1">
                {shifts.reduce((sum, s) => sum + parseFloat((s as any).duration_hours || s.duration_hours || 0), 0)}h
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Volume total</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-slate-200 mb-1">
                {new Set(shifts.map(s => s.employee)).size}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Effectif</span>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-indigo-400 mb-1">
                {shifts.filter(s => s.generated_by_ai).length}
              </span>
              <span className="text-xs font-semibold text-indigo-500/70 uppercase tracking-widest">Suggestions IA</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-4"
        >
          <Link href="/hr-agent/compliance" className="group flex items-center justify-between p-5 bg-gradient-to-br from-rose-500/10 to-[#0A0D14] border border-rose-500/20 rounded-3xl hover:border-rose-500/40 transition-all shadow-xl shadow-rose-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-slate-200 font-bold mb-0.5">Audit de conformité</h3>
                <p className="text-slate-500 text-xs font-medium">Loi du travail & Santé</p>
              </div>
            </div>
          </Link>

          <Link href="/hr-agent/absences" className="group flex items-center justify-between p-5 bg-gradient-to-br from-amber-500/10 to-[#0A0D14] border border-amber-500/20 rounded-3xl hover:border-amber-500/40 transition-all shadow-xl shadow-amber-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-slate-200 font-bold mb-0.5">Gérer les absences</h3>
                <p className="text-slate-500 text-xs font-medium">Congés et remplacements</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
