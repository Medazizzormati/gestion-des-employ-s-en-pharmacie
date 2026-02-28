'use client';

import { useChatMessage } from '@/hooks/useHRAgent';
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EXAMPLES = [
  "Quels employés sont en violation de conformité ?",
  "Nombre minimal de pharmaciens requis ?",
  "Générez un horaire optimisé pour la semaine",
  "Comment approuver une absence en respectant la loi ?",
];

type Message = { id: string; content: string; is_ai: boolean; timestamp: Date; };

export default function ChatPage() {
  const { mutate: sendMessage, isPending } = useChatMessage();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isPending) return;
    const userMsg: Message = { id: Date.now().toString(), content: input, is_ai: false, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const sent = input;
    setInput('');
    sendMessage(sent, {
      onSuccess: (data: any) => {
        const aiMsg: Message = { id: (Date.now() + 1).toString(), content: data?.response || data?.message || 'Réponse reçue.', is_ai: true, timestamp: new Date() };
        setMessages(prev => [...prev, aiMsg]);
      },
      onError: () => {
        const errMsg: Message = { id: (Date.now() + 1).toString(), content: '⚠️ Erreur de connexion au backend. Veuillez vérifier que l\'API est active.', is_ai: true, timestamp: new Date() };
        setMessages(prev => [...prev, errMsg]);
      },
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto pb-6">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 shrink-0 relative">
        <div className="absolute top-0 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-full px-4 py-1.5 mb-4 group hover:border-purple-500/40 transition-colors">
          <Sparkles size={14} className="text-purple-400 group-hover:animate-spin-slow" />
          <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">Moteur d'IA : Claude Opus Actif</span>
        </div>

        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Bot size={24} className="text-white relative z-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400 tracking-tight">
            Assistant RH Intelligent
          </h1>
        </div>
        <p className="text-slate-400 text-sm font-medium max-w-2xl leading-relaxed ml-16">
          Votre copilote expert. Posez vos questions sur la gestion d'équipe,
          l'optimisation des plannings et la conformité stricte au droit du travail des pharmacies françaises.
        </p>
      </motion.div>

      {/* ── Chat window ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 bg-[#0A0D14]/80 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-2xl relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        {/* Messages Layout */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 relative z-10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center mb-6 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl group-hover:scale-110 transition-transform duration-500" />
                <Bot size={48} className="text-indigo-400 relative z-10" />

                {/* Floating particles */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="absolute bottom-4 left-2 w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <div className="absolute top-8 -right-2 w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }} />
              </motion.div>

              <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-slate-200 mb-2"
              >
                Comment puis-je vous aider ?
              </motion.h3>

              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 text-sm mb-10"
              >
                Posez-moi n'importe quelle question ou utilisez les suggestions ci-dessous.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
              >
                {EXAMPLES.map((q, i) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 rounded-2xl text-left transition-all group flex gap-3"
                  >
                    <MessageSquare size={16} className="text-slate-600 group-hover:text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-slate-400 group-hover:text-slate-200 font-medium leading-relaxed">{q}</span>
                  </button>
                ))}
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
              <AnimatePresence initial={false}>
                {messages.map((msg: any) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex gap-4 ${msg.is_ai ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border shadow-lg ${msg.is_ai
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-white/10 text-white shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 text-slate-300'
                      }`}>
                      {msg.is_ai ? <Bot size={20} /> : <User size={18} />}
                    </div>

                    <div className={`max-w-[80%] flex flex-col ${msg.is_ai ? 'items-start' : 'items-end'}`}>
                      <div className={`px-6 py-4 rounded-3xl ${msg.is_ai
                          ? 'bg-white/[0.03] border border-white/5 rounded-tl-sm backdrop-blur-sm shadow-xl'
                          : 'bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-indigo-500/20 rounded-tr-sm'
                        }`}>
                        <div className="text-[15px] text-slate-200 leading-relaxed font-medium whitespace-pre-wrap prose prose-invert prose-p:my-1 prose-a:text-sky-400 max-w-none">
                          {msg.content}
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold tracking-wider text-slate-500 mt-2 px-2">
                        {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                    <Bot size={20} className="text-white relative z-10" />
                  </div>
                  <div className="px-6 py-4 bg-white/[0.03] border border-white/5 rounded-3xl rounded-tl-sm flex items-center gap-3 backdrop-blur-sm">
                    <Loader2 size={16} className="animate-spin text-purple-400" />
                    <span className="text-[14px] font-medium text-slate-400">Analyse de la demande en cours...</span>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} className="h-4" />
            </div>
          )}
        </div>

        {/* ── Input Area ── */}
        <div className="p-4 md:p-6 bg-black/40 border-t border-white/5 backdrop-blur-lg relative z-20">
          <div className="max-w-4xl mx-auto flex gap-3 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-purple-500/5 rounded-2xl pointer-events-none" />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !isPending) handleSend(); }}
              placeholder={isPending ? "L'IA génère sa réponse..." : "Posez une question, ou demandez de vérifier un planning..."}
              disabled={isPending}
              className="flex-1 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.06] border border-white/10 focus:border-indigo-500/50 rounded-2xl px-6 py-4 text-slate-200 text-[15px] font-medium outline-none transition-all placeholder:text-slate-500 shadow-inner"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isPending}
              className={`
                group px-6 py-4 rounded-2xl flex items-center gap-3 font-bold text-sm transition-all overflow-hidden relative shrink-0
                ${input.trim() && !isPending
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 border border-white/10 cursor-pointer'
                  : 'bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed'
                }
              `}
            >
              {input.trim() && !isPending && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
              <span className="relative z-10 hidden sm:inline">Envoyer</span>
              <Send size={18} className={`relative z-10 ${input.trim() && !isPending ? 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
