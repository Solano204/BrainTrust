"use client";

import * as React from "react";
import { useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import {
  Users, BookOpen, Brain, AlertCircle, Loader2, RefreshCw,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  GraduationCap, ArrowUpDown, Sparkles, ShieldAlert, Lightbulb,
  CheckCircle2, AlertTriangle, Info,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import {
  useAdminStats, useAIBreakdown, useUserCounts, useCoursesByAI,
  useCoursesByLate, useTopQuizzes, useLateSubmissionsPaginated,
  useAIAssignmentsPaginated, useAIInsights,
} from "@/components/admin/hooks/useAdminStats";

import type { AIInsight, InsightCategory } from "@/components/admin/api/aiinsightsApi";

const C = {
  blue: "#3b82f6", emerald: "#10b981", amber: "#f59e0b", red: "#ef4444",
  violet: "#8b5cf6", rose: "#f43f5e", cyan: "#06b6d4", slate: "#64748b",
  indigo: "#6366f1", teal: "#14b8a6", orange: "#f97316", pink: "#ec4899",
};
const AI_SLICE_COLORS = [C.red, C.amber, C.cyan, C.emerald];

function isUnitIdPattern(unitName: string): boolean {
  return /^(UNIT|unit|Unit)[-_]/i.test(unitName) || /^[A-Z0-9\-_]+$/.test(unitName);
}

function getMonthOptions() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = date.toISOString().slice(0, 7); // "2025-01"
    const label = date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return months;
}

function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
          <span className="text-muted-foreground">{e.name}:</span>
          <span className="font-semibold text-foreground ml-auto pl-3">
            {typeof e.value === "number" ? (e.value % 1 !== 0 ? e.value.toFixed(1) : e.value) : e.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const e = payload[0];
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: e.payload?.fill || e.color }} />
        <span className="font-semibold text-foreground">{e.name}</span>
      </div>
      <p className="text-muted-foreground mt-1">Cantidad: <span className="font-semibold text-foreground">{e.value}</span></p>
      {e.payload?.pct !== undefined && (
        <p className="text-muted-foreground">Porcentaje: <span className="font-semibold text-foreground">{Number(e.payload.pct).toFixed(1)}%</span></p>
      )}
    </div>
  );
}

const RADIAN = Math.PI / 180;
function renderOuterLabel({ cx, cy, midAngle, outerRadius, name, pct, value }: any) {
  if (pct !== undefined && Number(pct) < 2 && value < 1) return null;
  const r = outerRadius + 30;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  const display = pct !== undefined ? `${name}: ${Number(pct).toFixed(1)}%` : `${name}: ${value}`;
  return (
    <text x={x} y={y} fill="currentColor" className="text-foreground" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={11} fontWeight={600}>
      {display}
    </text>
  );
}

function DescriptionTooltip({ text }: { text: string }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="p-1 text-muted-foreground hover:text-foreground"
      >
        <Info className="w-4 h-4" />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full right-0 mb-2 w-56 bg-popover border border-border rounded-lg p-3 text-xs text-muted-foreground shadow-lg">
          {text}
          <div className="absolute top-full right-2 border-4 border-transparent border-t-border" />
        </div>
      )}
    </div>
  );
}

function InsightBanner({ insight, isLoading }: { insight?: AIInsight; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 mt-5">
        <Loader2 className="h-4 w-4 animate-spin text-violet-500 flex-shrink-0" />
        <span className="text-xs text-violet-700 dark:text-violet-300">Generando análisis con IA...</span>
      </div>
    );
  }
  if (!insight) return null;

  const cfg = {
    critical: { icon: <ShieldAlert className="w-4 h-4" />, bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-200 dark:border-red-800", titleColor: "text-red-800 dark:text-red-200", textColor: "text-red-700 dark:text-red-300", iconColor: "text-red-500", badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" },
    warning: { icon: <AlertTriangle className="w-4 h-4" />, bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-800", titleColor: "text-amber-800 dark:text-amber-200", textColor: "text-amber-700 dark:text-amber-300", iconColor: "text-amber-500", badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" },
    recommendation: { icon: <Lightbulb className="w-4 h-4" />, bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200 dark:border-blue-800", titleColor: "text-blue-800 dark:text-blue-200", textColor: "text-blue-700 dark:text-blue-300", iconColor: "text-blue-500", badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" },
    positive: { icon: <CheckCircle2 className="w-4 h-4" />, bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-800", titleColor: "text-emerald-800 dark:text-emerald-200", textColor: "text-emerald-700 dark:text-emerald-300", iconColor: "text-emerald-500", badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" },
  }[insight.type];

  return (
    <div className={`px-4 py-4 rounded-xl ${cfg.bg} border ${cfg.border} mt-5`}>
      <div className="flex items-start gap-3">
        <div className={`${cfg.iconColor} flex-shrink-0 mt-0.5`}>{cfg.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className={`font-bold text-sm ${cfg.titleColor}`}>{insight.title}</p>
            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
              <Sparkles className="w-2.5 h-2.5" />
              IA
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${cfg.textColor}`}>
            {insight.text}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  description: string; // ← NOW REQUIRED
  children: React.ReactNode;
  actions?: React.ReactNode;
  insight?: AIInsight;
  insightLoading?: boolean;
}

function ChartCard({ title, description, children, actions, insight, insightLoading }: ChartCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        {actions}
      </div>
      {children}
      <InsightBanner insight={insight} isLoading={insightLoading} />
    </div>
  );
}

function SectionLoader({ label }: { label: string }) {
  return <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3"><Loader2 className="h-6 w-6 animate-spin" /><span className="text-sm">{label}</span></div>;
}

function SectionError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="h-6 w-6 text-destructive" /><p className="text-sm text-destructive">{message}</p>{onRetry && <button onClick={onRetry} className="text-xs underline text-muted-foreground hover:text-foreground">Reintentar</button>}</div>;
}

function MiniPaginator({ page, totalPages, totalElements, pageSize, onPageChange }: { page: number; totalPages: number; totalElements: number; pageSize: number; onPageChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground mt-2">
      <span>{page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalElements)} de {totalElements}</span>
      <div className="flex items-center gap-1">
        <button disabled={page === 0} onClick={() => onPageChange(0)} className="p-1 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronsLeft className="h-3.5 w-3.5" /></button>
        <button disabled={page === 0} onClick={() => onPageChange(page - 1)} className="p-1 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-3.5 w-3.5" /></button>
        <span className="px-2 font-medium text-foreground">{page + 1} / {totalPages || 1}</span>
        <button disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)} className="p-1 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronRight className="h-3.5 w-3.5" /></button>
        <button disabled={page >= totalPages - 1} onClick={() => onPageChange(totalPages - 1)} className="p-1 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronsRight className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

export function StatisticsPanel() {
  const [courseSort, setCourseSort] = useState<"asc" | "desc">("desc");
  const [courseRankBy, setCourseRankBy] = useState<"ai" | "late">("ai");
  const [quizLimit, setQuizLimit] = useState(10);
  const [latePage, setLatePage] = useState(0);
  const [aiAssignPage, setAiAssignPage] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<string>("all"); // ← Month filter (default: all months)
  const PAGE_SIZE = 10;

  const adminStats = useAdminStats();
  const aiBreakdown = useAIBreakdown();
  const userCounts = useUserCounts();
  const coursesByAI = useCoursesByAI(courseRankBy === "ai" ? courseSort : "desc");
  const coursesByLate = useCoursesByLate(courseRankBy === "late" ? courseSort : "desc");
  const topQuizzes = useTopQuizzes(quizLimit);
  const lateSubmissions = useLateSubmissionsPaginated(latePage, PAGE_SIZE, selectedMonth === "all" ? undefined : selectedMonth);
  const aiAssignments = useAIAssignmentsPaginated(aiAssignPage, PAGE_SIZE, selectedMonth === "all" ? undefined : selectedMonth);
  const aiInsights = useAIInsights(adminStats.data, aiBreakdown.data, userCounts.data, coursesByAI.data);

  const getInsight = (cat: InsightCategory): AIInsight | undefined => aiInsights.data?.insights?.find((i) => i.category === cat);
  const iLoading = aiInsights.isFetching;

  const stats = adminStats.data;
  const breakdown = aiBreakdown.data;
  const counts = userCounts.data;
  const courses = courseRankBy === "ai" ? coursesByAI.data : coursesByLate.data;
  const coursesLoading = courseRankBy === "ai" ? coursesByAI.isLoading : coursesByLate.isLoading;

  const aiPieData = breakdown ? [
    { name: "100% IA", value: breakdown.countFullAI, pct: breakdown.percentageFullAI },
    { name: "50-99% IA", value: breakdown.countHighAI, pct: breakdown.percentageHighAI },
    { name: "1-49% IA", value: breakdown.countLowAI, pct: breakdown.percentageLowAI },
    { name: "Humano", value: breakdown.countHuman, pct: breakdown.percentageHuman },
  ] : [];

  const deadlineData = stats ? [
    { name: "Vencidas", value: stats.deadlineStats.overdue, color: C.red },
    { name: "Por vencer", value: stats.deadlineStats.dueSoon, color: C.amber },
    { name: "Próximas", value: stats.deadlineStats.upcoming, color: C.emerald },
  ] : [];

  const teacherBarData = (stats?.teacherStats ?? []).map((t) => ({
    name: t.teacherName, tareas: t.totalAssignments, iaDetectadas: t.aiDetectedCount, promedioIA: Number((t.averageAIProbability ?? 0).toFixed(1)),
  }));

  const unitBarData = (stats?.assignmentStats.assignmentsByUnit ?? [])
    .filter(u => u.unitName && u.unitName.trim())
    .map((u) => {
      let displayName = u.unitName;
      
      if (isUnitIdPattern(u.unitName)) {
        displayName = u.courseName || u.unitName;
      } else if (u.courseName) {
        displayName = `${u.unitName} (${u.courseName})`;
      }
      
      return {
        name: displayName,
        tareas: u.count,
        promedioIA: Number((u.averageAIProbability ?? 0).toFixed(1)),
      };
    });

  const usersBarData = counts ? [
    { name: "Est. Activos", value: counts.totalActiveStudents, color: C.emerald },
    { name: "Est. Inactivos", value: counts.totalStudents - counts.totalActiveStudents, color: C.slate },
    { name: "Prof. Activos", value: counts.totalActiveTeachers, color: C.blue },
    { name: "Prof. Inactivos", value: counts.totalTeachers - counts.totalActiveTeachers, color: C.slate },
  ] : [];

  const overallGaugeData = stats ? [{ name: "Analizadas", value: Number(stats.overallStats.percentageAnalyzed?.toFixed(0) ?? 0), fill: C.emerald }] : [];

  const assignmentTypesData = stats ? [
    { name: "Activas", value: stats.assignmentStats.totalActive, color: C.blue },
    { name: "Inactivas", value: stats.assignmentStats.totalInactive, color: C.slate },
    { name: "Grupales", value: stats.assignmentStats.totalGroupAssignments, color: C.violet },
    { name: "Individuales", value: stats.assignmentStats.totalIndividualAssignments, color: C.teal },
  ] : [];

  const quizBarData = (topQuizzes.data ?? []).slice(0, 10).map((q) => ({
    name: `${q.studentName.split(" ")[0]} - ${q.quizTitle.length > 15 ? q.quizTitle.substring(0, 15) + "…" : q.quizTitle}`,
    porcentaje: Number(q.percentage), nota: Number(q.grade),
  }));

  const lateBarData = (lateSubmissions.data?.content ?? []).slice(0, 10).map((s) => ({
    name: `${s.studentName.split(" ")[0]} - ${s.assignmentTitle.length > 12 ? s.assignmentTitle.substring(0, 12) + "…" : s.assignmentTitle}`,
    minutosLate: s.minutesLate, pctIA: Number(s.aiProbability),
  }));

  const aiAssignBarData = (aiAssignments.data?.content ?? []).slice(0, 10).map((a) => ({
    name: `${a.studentName.split(" ")[0]} - ${a.assignmentTitle.length > 12 ? a.assignmentTitle.substring(0, 12) + "…" : a.assignmentTitle}`,
    pctIA: Number(a.aiProbability),
  }));

  const monthOptions = getMonthOptions();

  if (adminStats.isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="flex flex-col items-center gap-3"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-sm text-muted-foreground">Cargando estadísticas...</p></div></div>;
  }
  if (adminStats.error) {
    return <SectionError message="No se pudieron cargar las estadísticas." onRetry={() => adminStats.refetch()} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mb-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Panel de Estadísticas</h1>
            <p className="text-muted-foreground text-sm">Análisis detallado de IA, entregas y desempeño académico</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => aiInsights.refetch()} 
              disabled={aiInsights.isFetching} 
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-violet-300 dark:border-violet-700 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 disabled:opacity-40 transition-all"
              title="Genera análisis detallado con IA de Google Gemini"
            >
              {aiInsights.isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {aiInsights.data ? "Regenerar IA" : "Generar Insights IA"}
            </button>
            <button 
              onClick={() => { adminStats.refetch(); aiBreakdown.refetch(); userCounts.refetch(); }} 
              disabled={adminStats.isFetching} 
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${adminStats.isFetching ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard 
            title="Desglose de IA en Entregas" 
            description="Distribución de las entregas por nivel de probabilidad de uso de IA. Ayuda a identificar qué porcentaje de trabajos podrían haber sido generados completamente por IA vs. entregas completamente humanas."
            insight={getInsight("ai_breakdown")} 
            insightLoading={iLoading}
          >
            {aiBreakdown.isLoading ? <SectionLoader label="Cargando..." /> : aiPieData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">Sin datos</p> : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={aiPieData} cx="50%" cy="50%" labelLine outerRadius={85} innerRadius={30} dataKey="value" paddingAngle={2} label={renderOuterLabel}>
                    {aiPieData.map((_, i) => <Cell key={i} fill={AI_SLICE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard 
            title="Estado de Fechas de Entrega" 
            description="Visualiza las tareas vencidas, próximas a vencer y próximas. Permite identificar acumulaciones de trabajo y planificar mejor las cargas académicas."
            insight={getInsight("deadlines")} 
            insightLoading={iLoading}
          >
            {deadlineData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">Sin datos</p> : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={deadlineData} cx="50%" cy="50%" labelLine outerRadius={85} innerRadius={30} dataKey="value" paddingAngle={2} label={renderOuterLabel}>
                    {deadlineData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard 
            title="Entregas Detectadas con IA" 
            description="Muestra las entregas individuales ordenadas por probabilidad de IA. Cada barra representa una entrega; valores más altos indican mayor probabilidad de uso de herramientas de IA."
            actions={
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[150px] h-8 rounded-xl text-xs">
                  <SelectValue placeholder="Todos los meses" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Todos los meses</SelectItem>
                  {monthOptions.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            }
            insight={getInsight("ai_assignments")} 
            insightLoading={iLoading}
          >
            {aiAssignments.isLoading ? <SectionLoader label="Cargando..." /> : aiAssignBarData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">Sin detecciones</p> : (
              <>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={aiAssignBarData} margin={{ bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" opacity={0.5} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground, #6b7280)" tick={{ fontSize: 9 }} interval={0} angle={-35} textAnchor="end" height={70} />
                    <YAxis stroke="var(--muted-foreground, #6b7280)" unit="%" />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend />
                    <Bar dataKey="pctIA" fill={C.rose} name="% IA" radius={[4, 4, 0, 0]}>
                      {aiAssignBarData.map((e, i) => <Cell key={i} fill={e.pctIA >= 80 ? C.red : e.pctIA >= 50 ? C.amber : C.cyan} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {aiAssignments.data && aiAssignments.data.totalPages > 1 && (
                  <MiniPaginator page={aiAssignPage} totalPages={aiAssignments.data.totalPages} totalElements={aiAssignments.data.totalElements} pageSize={PAGE_SIZE} onPageChange={setAiAssignPage} />
                )}
              </>
            )}
          </ChartCard>

          <ChartCard 
            title="Entregas Tardías" 
            description="Analiza la relación entre retraso (en minutos) y probabilidad de IA. Útil para detectar si los estudiantes con entregas tardías también están usando herramientas de IA."
            actions={
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[150px] h-8 rounded-xl text-xs">
                  <SelectValue placeholder="Todos los meses" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Todos los meses</SelectItem>
                  {monthOptions.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            }
            insight={getInsight("late_submissions")} 
            insightLoading={iLoading}
          >
            {lateSubmissions.isLoading ? <SectionLoader label="Cargando..." /> : lateBarData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">No hay entregas tardías</p> : (
              <>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={lateBarData} margin={{ bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" opacity={0.5} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground, #6b7280)" tick={{ fontSize: 9 }} interval={0} angle={-35} textAnchor="end" height={70} />
                    <YAxis yAxisId="left" stroke={C.amber} />
                    <YAxis yAxisId="right" orientation="right" stroke={C.rose} unit="%" />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="minutosLate" fill={C.amber} name="Min. Tarde" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="pctIA" fill={C.rose} name="% IA" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                {lateSubmissions.data && lateSubmissions.data.totalPages > 1 && (
                  <MiniPaginator page={latePage} totalPages={lateSubmissions.data.totalPages} totalElements={lateSubmissions.data.totalElements} pageSize={PAGE_SIZE} onPageChange={setLatePage} />
                )}
              </>
            )}
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard 
            title="Cursos — IA y Entregas Tardías" 
            description={courseRankBy === "ai" ? "Ranking de cursos por porcentaje de IA detectada. Identifica qué cursos tienen mayor incidencia de uso de herramientas de IA." : "Ranking de cursos por porcentaje de entregas tardías. Muestra qué cursos tienen problemas de cumplimiento de plazos."}
            actions={
              <div className="flex items-center gap-2">
                <Select value={courseRankBy} onValueChange={(v) => setCourseRankBy(v as "ai" | "late")}>
                  <SelectTrigger className="w-[130px] h-8 rounded-xl text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl"><SelectItem value="ai">Por % IA</SelectItem><SelectItem value="late">Por % Tardías</SelectItem></SelectContent>
                </Select>
                <button onClick={() => setCourseSort((s) => s === "desc" ? "asc" : "desc")} className="p-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"><ArrowUpDown className="h-3.5 w-3.5" /></button>
              </div>
            }
            insight={getInsight("courses")} 
            insightLoading={iLoading}
          >
            {coursesLoading ? <SectionLoader label="Cargando..." /> : !courses?.length ? <p className="text-sm text-muted-foreground text-center py-12">Sin datos</p> : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={courses.slice(0, 10)} margin={{ bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" opacity={0.5} />
                  <XAxis dataKey="courseName" stroke="var(--muted-foreground, #6b7280)" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={70} />
                  <YAxis stroke="var(--muted-foreground, #6b7280)" unit="%" />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend />
                  <Bar dataKey="aiPercentage" fill={C.rose} name="% IA" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="latePercentage" fill={C.amber} name="% Tardías" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="averageAIProbability" fill={C.cyan} name="IA Promedio" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard 
            title="Desempeño por Profesor" 
            description="Compara el número total de tareas creadas por cada profesor vs. las tareas donde se detectó IA. Ayuda a identificar disparidades en carga de trabajo y en incidencia de IA."
            insight={getInsight("teachers")} 
            insightLoading={iLoading}
          >
            {teacherBarData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">Sin datos</p> : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={teacherBarData} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" opacity={0.5} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground, #6b7280)" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis stroke="var(--muted-foreground, #6b7280)" />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend />
                  <Bar dataKey="tareas" fill={C.blue} name="Total Tareas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="iaDetectadas" fill={C.rose} name="IA Detectadas" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>



        <ChartCard 
          title="Mejores Calificaciones en Quizzes" 
          description="Muestra a los estudiantes con las mejores puntuaciones en quizzes. Los quizzes son confiables para validar aprendizaje real ya que se realizan en condiciones controladas."
          actions={<Select value={quizLimit.toString()} onValueChange={(v) => setQuizLimit(Number(v))}><SelectTrigger className="w-[80px] h-8 rounded-xl text-xs"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="5">Top 5</SelectItem><SelectItem value="10">Top 10</SelectItem><SelectItem value="20">Top 20</SelectItem></SelectContent></Select>}
          insight={getInsight("quizzes")} 
          insightLoading={iLoading}
        >
          {topQuizzes.isLoading ? <SectionLoader label="Cargando..." /> : quizBarData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">Sin datos</p> : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={quizBarData} margin={{ bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" opacity={0.5} />
                <XAxis dataKey="name" stroke="var(--muted-foreground, #6b7280)" tick={{ fontSize: 9 }} interval={0} angle={-35} textAnchor="end" height={70} />
                <YAxis stroke="var(--muted-foreground, #6b7280)" unit="%" />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend />
                <Bar dataKey="porcentaje" fill={C.emerald} name="% Calificación" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard 
            title="Estado General del Sistema" 
            description="Porcentaje de entregas analizadas. Muestra el progreso del análisis de IA en toda la plataforma y cuántas entregas aún están pendientes."
            insight={getInsight("overall")} 
            insightLoading={iLoading}
          >
            {overallGaugeData.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0} barSize={16} data={overallGaugeData}>
                    <RadialBar background dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="-mt-16 text-center">
                  <p className="text-3xl font-bold text-foreground">{stats?.overallStats.percentageAnalyzed?.toFixed(0) ?? 0}%</p>
                  <p className="text-xs text-muted-foreground">analizadas</p>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6 w-full text-center">
                  <div><p className="text-lg font-bold text-foreground">{stats?.overallStats.totalAssignments ?? 0}</p><p className="text-[11px] text-muted-foreground">Total</p></div>
                  <div><p className="text-lg font-bold text-emerald-600">{stats?.overallStats.totalAnalyzed ?? 0}</p><p className="text-[11px] text-muted-foreground">Analizadas</p></div>
                  <div><p className="text-lg font-bold text-amber-600">{stats?.overallStats.totalPending ?? 0}</p><p className="text-[11px] text-muted-foreground">Pendientes</p></div>
                </div>
              </div>
            ) : <SectionLoader label="..." />}
          </ChartCard>

          <ChartCard 
            title="Tipos de Tareas" 
            description="Distribución de tareas según su estado (activas/inactivas) y tipo (grupales/individuales). Ayuda a entender la estructura y diversidad de evaluaciones."
          >
            {assignmentTypesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={assignmentTypesData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" opacity={0.5} />
                  <XAxis type="number" stroke="var(--muted-foreground, #6b7280)" />
                  <YAxis dataKey="name" type="category" width={90} stroke="var(--muted-foreground, #6b7280)" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="value" name="Cantidad" radius={[0, 6, 6, 0]}>
                    {assignmentTypesData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <SectionLoader label="..." />}
          </ChartCard>

          <ChartCard 
            title="Usuarios Activos e Inactivos" 
            description="Compara el número de estudiantes y profesores activos vs. inactivos en la plataforma. Indicador importante para medir retención y compromiso."
            insight={getInsight("users")} 
            insightLoading={iLoading}
          >
            {usersBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={usersBarData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" opacity={0.5} />
                  <XAxis type="number" stroke="var(--muted-foreground, #6b7280)" />
                  <YAxis dataKey="name" type="category" width={100} stroke="var(--muted-foreground, #6b7280)" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="value" name="Cantidad" radius={[0, 6, 6, 0]}>
                    {usersBarData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <SectionLoader label="..." />}
          </ChartCard>
        </div>

      </div>
    </div>
  );
}

export default StatisticsPanel;
