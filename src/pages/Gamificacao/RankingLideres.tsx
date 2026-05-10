import React from 'react';
import { useGamificacao } from '../../hooks/useGamificacao';
import { Loader2, Trophy, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export default function RankingLideres() {
  const { rankingQuery } = useGamificacao();

  if (rankingQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center tracking-tight">
          <Trophy className="mr-3 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" /> 
          Top Cabos Eleitorais <span className="font-light ml-2 text-slate-400">| Gamificação</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Acompanhe as lideranças de campo que mais engajam a base e geram pontos.</p>
      </motion.div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-100/50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ranking</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Liderança</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Captação</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Score Estratégico</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={tableVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/40 dark:bg-slate-900/40 divide-y divide-slate-200/50 dark:divide-slate-800/50"
            >
              {rankingQuery.data?.map((lider: any, idx: number) => (
                <motion.tr 
                  variants={rowVariants}
                  whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)", scale: 1.005 }}
                  key={lider.id} 
                  className="transition-colors group cursor-default"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm group-hover:bg-blue-100 group-hover:text-blue-700 dark:group-hover:bg-blue-900 dark:group-hover:text-blue-300 transition-colors">
                      {idx + 1}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                        {lider.nome.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{lider.nome}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      <Users className="w-3 h-3 mr-1.5" />
                      {lider.eleitoresCaptados} Eleitores
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center text-yellow-600 dark:text-yellow-400 font-black text-lg glow-text">
                      <Star className="w-5 h-5 mr-1.5 fill-current" />
                      {lider.scoreLider} <span className="text-xs text-slate-400 font-medium ml-1 mt-1">pts</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
              
              {(!rankingQuery.data || rankingQuery.data.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">
                    O motor de Gamificação ainda não calculou nenhum ranking.
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
