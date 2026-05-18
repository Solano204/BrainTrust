'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  Users,
  BookOpen,
  Brain,
  TrendingUp,
  Award,
  AlertCircle,
  Filter,
  Download,
} from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────

const studentCountData = [
  { month: 'Ene', students: 45, activeStudents: 38 },
  { month: 'Feb', students: 52, activeStudents: 45 },
  { month: 'Mar', students: 58, activeStudents: 51 },
  { month: 'Abr', students: 65, activeStudents: 58 },
  { month: 'May', students: 72, activeStudents: 65 },
  { month: 'Jun', students: 85, activeStudents: 76 },
];

const aiGeneratedTasksData = [
  { month: 'Ene', tasks: 24, aiGenerated: 8, manual: 16 },
  { month: 'Feb', tasks: 32, aiGenerated: 14, manual: 18 },
  { month: 'Mar', tasks: 41, aiGenerated: 22, manual: 19 },
  { month: 'Abr', tasks: 38, aiGenerated: 18, manual: 20 },
  { month: 'May', tasks: 52, aiGenerated: 35, manual: 17 },
  { month: 'Jun', tasks: 68, aiGenerated: 48, manual: 20 },
];

const subjectsData = [
  { name: 'Matemáticas', students: 28, color: '#3b82f6' },
  { name: 'Español', students: 25, color: '#ef4444' },
  { name: 'Ciencias', students: 22, color: '#10b981' },
  { name: 'Historia', students: 18, color: '#f59e0b' },
  { name: 'Inglés', students: 15, color: '#8b5cf6' },
];

const taskSimilarityData = [
  { x: 85, y: 82, name: 'Carlos & Juan', similarity: 87 },
  { x: 92, y: 88, name: 'María & Sofia', similarity: 90 },
  { x: 78, y: 75, name: 'Pedro & Luis', similarity: 76 },
  { x: 88, y: 85, name: 'Ana & Rosa', similarity: 86 },
  { x: 95, y: 92, name: 'José & Miguel', similarity: 93 },
  { x: 72, y: 68, name: 'Laura & Carmen', similarity: 70 },
];

const teacherPerformanceData = [
  { teacher: 'Prof. García', tasksCreated: 45, avgCompletion: 92, students: 28 },
  { teacher: 'Prof. López', tasksCreated: 38, avgCompletion: 88, students: 24 },
  { teacher: 'Prof. Martínez', tasksCreated: 52, avgCompletion: 95, students: 31 },
  { teacher: 'Prof. Rodríguez', tasksCreated: 35, avgCompletion: 85, students: 20 },
];

const unitProgressData = [
  { unit: 'Unidad 1', completed: 95, inProgress: 4, pending: 1 },
  { unit: 'Unidad 2', completed: 78, inProgress: 15, pending: 7 },
  { unit: 'Unidad 3', completed: 45, inProgress: 35, pending: 20 },
  { unit: 'Unidad 4', completed: 12, inProgress: 50, pending: 38 },
];

const taskCompletionRateData = [
  { status: 'Completadas', value: 156, color: '#10b981' },
  { status: 'En Progreso', value: 42, color: '#f59e0b' },
  { status: 'Pendientes', value: 28, color: '#ef4444' },
];

// ─── Stat Card ─────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

function StatCard({ icon, title, value, change, changeType = 'neutral' }: StatCardProps) {
  const changeColor = {
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  }[changeType];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p className={`text-xs mt-2 ${changeColor}`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Chart Card ────────────────────────────────────────────────

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function StatisticsPanel() {
  const [dateRange, setDateRange] = useState('6months');

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gráficos y Estadísticas
            </h1>
            <p className="text-muted-foreground text-sm">
              Visualización de datos del sistema educativo
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="1month">Último mes</option>
              <option value="3months">Últimos 3 meses</option>
              <option value="6months">Últimos 6 meses</option>
              <option value="1year">Último año</option>
            </select>
            <button className="px-4 py-2 rounded-xl border border-border hover:bg-muted/50 transition-all flex items-center gap-2 text-sm font-medium">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Estudiantes Activos"
            value="85"
            change="+12% vs mes anterior"
            changeType="positive"
          />
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Total de Tareas"
            value="226"
            change="+18% vs mes anterior"
            changeType="positive"
          />
          <StatCard
            icon={<Brain className="w-6 h-6" />}
            title="Tareas IA"
            value="127"
            change="56% del total"
            changeType="neutral"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Tasa Finalización"
            value="87%"
            change="+5% vs mes anterior"
            changeType="positive"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Growth */}
          <ChartCard
            title="Crecimiento de Estudiantes"
            description="Evolución mensual de estudiantes totales y activos"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={studentCountData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                  name="Total de Estudiantes"
                />
                <Line
                  type="monotone"
                  dataKey="activeStudents"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                  name="Estudiantes Activos"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* AI Tasks vs Manual */}
          <ChartCard
            title="Tareas: IA vs Manual"
            description="Comparativa de tareas generadas por IA y creadas manualmente"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aiGeneratedTasksData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Bar dataKey="aiGenerated" stackId="a" fill="#8b5cf6" name="Generadas por IA" />
                <Bar dataKey="manual" stackId="a" fill="#f59e0b" name="Creadas Manualmente" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subjects Distribution */}
          <ChartCard
            title="Distribución por Asignatura"
            description="Cantidad de estudiantes por materia"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, students }) => `${name}: ${students}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="students"
                >
                  {subjectsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Task Completion Status */}
          <ChartCard
            title="Estado de Tareas"
            description="Distribución de tareas por estado"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskCompletionRateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, value }) => `${status}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskCompletionRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Similarity */}
          <ChartCard
            title="Similitud de Tareas Entre Estudiantes"
            description="Análisis de patrones en respuestas de estudiantes"
          >
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Calificación Student 1"
                  stroke="#6b7280"
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Calificación Student 2"
                  stroke="#6b7280"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                  cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }}
                />
                <Scatter
                  name="Pares de Estudiantes"
                  data={taskSimilarityData}
                  fill="#3b82f6"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Teacher Performance */}
          <ChartCard
            title="Desempeño de Profesores"
            description="Tareas creadas y tasa de finalización promedio"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teacherPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="teacher" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Bar dataKey="tasksCreated" fill="#3b82f6" name="Tareas Creadas" />
                <Bar dataKey="avgCompletion" fill="#10b981" name="% Finalización" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Unit Progress */}
        <ChartCard
          title="Progreso por Unidad"
          description="Estado de avance de cada unidad del curso"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={unitProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="unit" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completadas" />
              <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" name="En Progreso" />
              <Bar dataKey="pending" stackId="a" fill="#ef4444" name="Pendientes" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Alerts & Insights */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Alertas e Insights
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Unidad 4 necesita atención
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  38% de estudiantes aún no comienzan. Se recomienda enviar recordatorios.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Mayor uso de IA en últimas semanas
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  56% de nuevas tareas fueron generadas por IA. Tendencia en aumento.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
              <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-900 dark:text-emerald-100">
                  Prof. Martínez lidera en desempeño
                </p>
                <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">
                  95% de tasa de finalización con 52 tareas creadas este período.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsPanel;