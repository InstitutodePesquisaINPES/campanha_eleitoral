import { useRef, useState } from "react";
import { useBIStats } from "@/hooks/useBIStats";
import { useExportBI } from "@/hooks/useExportBI";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, ClipboardList, Calendar, MapPin, DollarSign, TrendingUp, TrendingDown, CheckCircle, Download, Loader2, BarChart4, Filter 
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart
} from "recharts";
import { motion, Variants } from "framer-motion";
import { categoriaLabels, statusLabels } from "@/hooks/useDemandas";
import { tipoAgendaLabels } from "@/hooks/useAgenda";
import { categoriaDespesaLabels } from "@/hooks/useFinanceiro";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316", "#6366F1"];

const nivelLabels: Record<string, string> = {
  desconhecido: "Desconhecido", frio: "Frio", morno: "Morno", quente: "Quente", aliado: "Aliado", lideranca: "Liderança",
};
const classificacaoLabels: Record<string, string> = {
  reduto: "Reduto", expansao: "Expansão", disputa: "Disputa", risco: "Risco", baixa_presenca: "Baixa Presença", sem_classificacao: "S/ Classif.",
};

function toChartData(obj: Record<string, number>, labels?: Record<string, string>) {
  return Object.entries(obj).map(([key, value]) => ({ name: labels?.[key] || key, value }));
}

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl shadow-blue-900/20">
        <p className="text-slate-300 text-xs font-bold mb-2 uppercase tracking-wider">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <span className="text-slate-100 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}
            </span>
            <span className="text-white font-black">
              {entry.name.includes("Receita") || entry.name.includes("Despesa") 
                ? formatCurrency(entry.value) 
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({ icon: Icon, label, value, sub, gradientFrom, gradientTo, isNegative = false }: { icon: React.ElementType; label: string; value: string | number; sub?: string; gradientFrom: string, gradientTo: string, isNegative?: boolean }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden group cursor-pointer border border-white/40 dark:border-slate-800/60"
    >
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${gradientFrom} ${gradientTo} group-hover:opacity-40 transition-opacity duration-500`}></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
          <h3 className={`text-3xl font-black ${isNegative ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'text-slate-800 dark:text-slate-100'}`}>
            {value}
          </h3>
          {sub && <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-2 font-medium">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-lg`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

// Framer Motion Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export function BIDashboard() {
  const { data: stats, isLoading } = useBIStats();
  const { exportElement, exporting } = useExportBI();
  const dashRef = useRef<HTMLDivElement>(null);
  
  const [timeFilter, setTimeFilter] = useState("6m");
  const [regionFilter, setRegionFilter] = useState("all");

  const doExport = (format: "png" | "pdf", upload = false) => {
    if (!dashRef.current) return;
    exportElement(dashRef.current, {
      format,
      title: "Inteligência Estratégica — Kiribamba",
      filename: `bi-dashboard-${new Date().toISOString().slice(0, 10)}`,
      upload,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 min-h-screen bg-slate-50 dark:bg-slate-950">
        <h1 className="text-2xl font-bold animate-pulse text-slate-400">Carregando painéis de inteligência...</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;
  const { totals } = stats;

  const demandasStatusData = toChartData(stats.demandasPorStatus, statusLabels);
  const demandasCatData = toChartData(stats.demandasPorCategoria, categoriaLabels);
  const pessoasNivelData = toChartData(stats.pessoasPorNivel, nivelLabels);
  const agendaTipoData = toChartData(stats.agendaPorTipo, tipoAgendaLabels);
  const despesasCatData = toChartData(stats.despesasPorCategoria, categoriaDespesaLabels);
  const bairrosClassData = toChartData(stats.bairrosPorClassificacao, classificacaoLabels);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-6">
      
      {/* HEADER & GLOBAL FILTERS */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center tracking-tight">
              <BarChart4 className="mr-3 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> 
              Inteligência de Dados <span className="font-light ml-2 text-slate-400">| BI</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Painel executivo de comando. Todos os indicadores em tempo real.</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700 shadow-md transition-all rounded-full px-6" disabled={exporting}>
                {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Exportar Relatório
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-slate-200 dark:border-slate-800">
              <DropdownMenuItem onClick={() => doExport("png")}>Salvar como Imagem (PNG)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => doExport("pdf")}>Gerar Documento (PDF)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => doExport("pdf", true)} className="text-blue-600 font-bold">Salvar na Nuvem (PDF)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Barra de Filtros Glassmorphic */}
        <div className="glass-card p-4 rounded-2xl flex flex-wrap gap-4 items-center border border-white/60 dark:border-slate-800/60 shadow-sm z-20 relative">
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mr-2">
            <Filter className="w-4 h-4 mr-2" /> Filtros
          </div>
          
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="1m">Últimos 30 Dias</SelectItem>
              <SelectItem value="3m">Último Trimestre</SelectItem>
              <SelectItem value="6m">Últimos 6 Meses</SelectItem>
              <SelectItem value="ytd">Este Ano</SelectItem>
            </SelectContent>
          </Select>

          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
              <SelectValue placeholder="Município" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Todas as Regiões</SelectItem>
              <SelectItem value="capital">Capital</SelectItem>
              <SelectItem value="interior">Interior</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* DASHBOARD CONTENT */}
      <motion.div ref={dashRef} variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 relative z-10">
        
        {/* SVG Defs for Gradients inside Recharts */}
        <svg style={{ height: 0, width: 0, position: 'absolute' }}>
          <defs>
            <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
            </linearGradient>
            
            <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA"/>
              <stop offset="100%" stopColor="#2563EB"/>
            </linearGradient>
            <linearGradient id="barEmerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399"/>
              <stop offset="100%" stopColor="#059669"/>
            </linearGradient>
            <linearGradient id="barRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F87171"/>
              <stop offset="100%" stopColor="#DC2626"/>
            </linearGradient>
          </defs>
        </svg>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants}><StatCard icon={Users} label="Total CRM (Eleitores)" value={totals.pessoas} gradientFrom="from-blue-400" gradientTo="to-blue-600" /></motion.div>
          <motion.div variants={itemVariants}><StatCard icon={ClipboardList} label="Demandas Ativas" value={totals.demandas} sub={`${totals.demandasResolvidas} resolvidas com sucesso`} gradientFrom="from-purple-400" gradientTo="to-purple-600" /></motion.div>
          <motion.div variants={itemVariants}><StatCard icon={Calendar} label="Ações de Campo" value={totals.agenda} gradientFrom="from-orange-400" gradientTo="to-orange-600" /></motion.div>
          <motion.div variants={itemVariants}><StatCard icon={MapPin} label="Geografia (Bairros)" value={totals.bairros} sub={`Distribuídos em ${totals.municipios} municípios`} gradientFrom="from-cyan-400" gradientTo="to-cyan-600" /></motion.div>
          
          <motion.div variants={itemVariants}><StatCard icon={TrendingUp} label="Receita Arrecadada" value={formatCurrency(totals.totalReceitas)} gradientFrom="from-emerald-400" gradientTo="to-emerald-600" /></motion.div>
          <motion.div variants={itemVariants}><StatCard icon={TrendingDown} label="Despesa Executada" value={formatCurrency(totals.totalDespesas)} gradientFrom="from-red-400" gradientTo="to-red-600" isNegative={true} /></motion.div>
          <motion.div variants={itemVariants}><StatCard icon={DollarSign} label="Saldo em Caixa" value={formatCurrency(totals.saldo)} gradientFrom={totals.saldo >= 0 ? "from-emerald-400" : "from-red-400"} gradientTo={totals.saldo >= 0 ? "to-emerald-600" : "to-red-600"} /></motion.div>
          <motion.div variants={itemVariants}><StatCard icon={CheckCircle} label="Taxa de Resolução" value={totals.demandas > 0 ? `${Math.round((totals.demandasResolvidas / totals.demandas) * 100)}%` : "–"} gradientFrom="from-indigo-400" gradientTo="to-indigo-600" /></motion.div>
        </div>

        {/* Gráfico Principal: Evolução */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Evolução Temporal da Campanha
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Crescimento de base, engajamento e eventos ao longo dos últimos meses.</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                
                <Area type="monotone" dataKey="pessoas" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorBlue)" name="Novos Eleitores (CRM)" />
                <Area type="monotone" dataKey="demandas" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRed)" name="Demandas Registradas" />
                <Area type="monotone" dataKey="eventos" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorEmerald)" name="Eventos Executados" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gráficos Secundários Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Categoria das Demandas */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">Demandas por Categoria</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={demandasCatData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} angle={-35} textAnchor="end" interval={0} height={60} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                <Bar dataKey="value" fill="url(#barBlue)" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Despesas Financeiras */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">Despesas Financeiras (R$)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={despesasCatData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} angle={-35} textAnchor="end" interval={0} height={60} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={v => `R$ ${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                <Bar dataKey="value" fill="url(#barRed)" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Temperatura da Base (Pessoas) */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">Temperatura da Base (CRM)</h3>
            <div className="flex h-[250px] items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pessoasNivelData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pessoasNivelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bairros Classificação */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">Distribuição Geopolítica (Bairros)</h3>
            <div className="flex h-[250px] items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bairrosClassData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {bairrosClassData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
