"use server";

/**
 * aiInsightsApi.ts
 *
 * Calls Google Gemini (gemini-2.5-flash) to generate DETAILED insights
 * per dashboard category. Each insight is 3-5 sentences with specific
 * data, root-cause analysis, comparisons, and concrete action steps.
 *
 * Requires env: GOOGLE_AI_API_KEY
 * Place at: components/admin/api/aiInsightsApi.ts
 */

import type {
  AdminStatsDTO,
  AIStatsBreakdownDTO,
  UserCountDTO,
  CourseAIStatsDTO,
} from "@/components/admin/api/adminStatsApi";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type InsightCategory =
  | "ai_breakdown"
  | "deadlines"
  | "teachers"
  | "units"
  | "courses"
  | "quizzes"
  | "late_submissions"
  | "ai_assignments"
  | "users"
  | "overall"
  | "general";

export interface AIInsight {
  id: string;
  type: "warning" | "recommendation" | "positive" | "critical";
  title: string;
  text: string;
  category: InsightCategory;
  priority: number;
}

export interface AIInsightsResponse {
  insights: AIInsight[];
  generatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Build data context
// ─────────────────────────────────────────────────────────────

function buildDataContext(
  stats: AdminStatsDTO,
  breakdown: AIStatsBreakdownDTO | null,
  userCounts: UserCountDTO | null,
  coursesByAI: CourseAIStatsDTO[] | null
): string {
  const s: string[] = [];

  s.push(`ESTADÍSTICAS GENERALES:
- Total tareas: ${stats.overallStats.totalAssignments}
- Analizadas: ${stats.overallStats.totalAnalyzed}
- Pendientes de análisis: ${stats.overallStats.totalPending}
- % Analizadas: ${stats.overallStats.percentageAnalyzed}%
- Activas: ${stats.assignmentStats.totalActive}
- Inactivas: ${stats.assignmentStats.totalInactive}
- Grupales: ${stats.assignmentStats.totalGroupAssignments}
- Individuales: ${stats.assignmentStats.totalIndividualAssignments}`);

  if (userCounts) {
    const inactStu = userCounts.totalStudents - userCounts.totalActiveStudents;
    const inactTea = userCounts.totalTeachers - userCounts.totalActiveTeachers;
    const stuPct = userCounts.totalStudents > 0 ? ((inactStu / userCounts.totalStudents) * 100).toFixed(1) : "0";
    const teaPct = userCounts.totalTeachers > 0 ? ((inactTea / userCounts.totalTeachers) * 100).toFixed(1) : "0";
    s.push(`USUARIOS:
- Estudiantes: ${userCounts.totalStudents} total, ${userCounts.totalActiveStudents} activos, ${inactStu} inactivos (${stuPct}% inactivos)
- Profesores: ${userCounts.totalTeachers} total, ${userCounts.totalActiveTeachers} activos, ${inactTea} inactivos (${teaPct}% inactivos)`);
  }

  if (breakdown) {
    const totalWithAI = breakdown.countFullAI + breakdown.countHighAI + breakdown.countLowAI;
    const pctWithAnyAI = breakdown.totalSubmissions > 0 ? ((totalWithAI / breakdown.totalSubmissions) * 100).toFixed(1) : "0";
    s.push(`DESGLOSE DETALLADO DE IA EN ENTREGAS:
- Promedio general de probabilidad IA: ${breakdown.averageAIProbability}%
- Entregas 100% IA (totalmente generadas): ${breakdown.countFullAI} (${breakdown.percentageFullAI}% del total)
- Entregas 50-99% IA (alto uso de IA): ${breakdown.countHighAI} (${breakdown.percentageHighAI}% del total)
- Entregas 1-49% IA (bajo uso de IA): ${breakdown.countLowAI} (${breakdown.percentageLowAI}% del total)
- Entregas 0% IA (completamente humanas): ${breakdown.countHuman} (${breakdown.percentageHuman}% del total)
- Total con algún nivel de IA: ${totalWithAI} entregas (${pctWithAnyAI}%)
- Total analizadas: ${breakdown.totalAnalyzed} de ${breakdown.totalSubmissions} entregas
- Ratio de análisis: ${breakdown.totalSubmissions > 0 ? ((breakdown.totalAnalyzed / breakdown.totalSubmissions) * 100).toFixed(1) : 0}%`);
  }

  s.push(`FECHAS DE ENTREGA:
- Tareas vencidas (overdue): ${stats.deadlineStats.overdue}
- Por vencer pronto (due soon): ${stats.deadlineStats.dueSoon}
- Próximas (upcoming): ${stats.deadlineStats.upcoming}
- Total con fechas: ${stats.deadlineStats.overdue + stats.deadlineStats.dueSoon + stats.deadlineStats.upcoming}`);

  if (stats.teacherStats?.length > 0) {
    const sorted = [...stats.teacherStats].sort((a, b) => b.totalAssignments - a.totalAssignments);
    const avgTasks = sorted.reduce((sum, t) => sum + t.totalAssignments, 0) / sorted.length;
    const avgAI = sorted.reduce((sum, t) => sum + t.averageAIProbability, 0) / sorted.length;
    s.push(`PROFESORES (${sorted.length} total, promedio ${avgTasks.toFixed(0)} tareas/profesor, promedio IA general ${avgAI.toFixed(1)}%):
${sorted.map(t => `  - ${t.teacherName}: ${t.totalAssignments} tareas, ${t.aiDetectedCount} con IA detectada (${t.totalAssignments > 0 ? ((t.aiDetectedCount / t.totalAssignments) * 100).toFixed(0) : 0}%), promedio IA ${t.averageAIProbability}%`).join("\n")}`);
  }

  if (coursesByAI?.length) {
    const avgAI = coursesByAI.reduce((sum, c) => sum + Number(c.aiPercentage), 0) / coursesByAI.length;
    const avgLate = coursesByAI.reduce((sum, c) => sum + Number(c.latePercentage), 0) / coursesByAI.length;
    s.push(`CURSOS (${coursesByAI.length} total, promedio IA ${avgAI.toFixed(1)}%, promedio tardías ${avgLate.toFixed(1)}%):
${coursesByAI.slice(0, 10).map(c => `  - ${c.courseName} (Prof. ${c.teacherName}): ${c.totalSubmissions} entregas, ${c.aiDetectedSubmissions} con IA (${c.aiPercentage}%), ${c.lateSubmissions} tardías (${c.latePercentage}%), prom IA ${c.averageAIProbability}%`).join("\n")}`);
  }

  if (stats.assignmentStats.assignmentsByUnit?.length) {
    const units = stats.assignmentStats.assignmentsByUnit;
    const totalTasks = units.reduce((sum, u) => sum + u.count, 0);
    const avgAI = units.reduce((sum, u) => sum + u.averageAIProbability, 0) / units.length;
    s.push(`UNIDADES (${units.length} unidades, ${totalTasks} tareas total, promedio IA ${avgAI.toFixed(1)}%):
${units.map(u => `  - ${u.unitName}: ${u.count} tareas (${totalTasks > 0 ? ((u.count / totalTasks) * 100).toFixed(0) : 0}% del total), IA promedio ${u.averageAIProbability}%`).join("\n")}`);
  }

  return s.join("\n\n");
}

// ─────────────────────────────────────────────────────────────
// Gemini API
// ─────────────────────────────────────────────────────────────

const GEMINI_MODEL = "gemini-2.5-flash";

export async function generateAIInsights(
  stats: AdminStatsDTO,
  breakdown: AIStatsBreakdownDTO | null,
  userCounts: UserCountDTO | null,
  coursesByAI: CourseAIStatsDTO[] | null
): Promise<AIInsightsResponse> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    console.warn("GOOGLE_AI_API_KEY not set — using fallback");
    return generateFallbackInsights(stats, breakdown, userCounts, coursesByAI);
  }

  const dataContext = buildDataContext(stats, breakdown, userCounts, coursesByAI);

  const prompt = `Eres un analista educativo senior de la plataforma BrainTrust. Tu trabajo es generar análisis DETALLADOS y ACCIONABLES para cada sección del dashboard administrativo.

DATOS COMPLETOS DEL SISTEMA:
${dataContext}

INSTRUCCIONES CRÍTICAS:
- Genera EXACTAMENTE 1 insight por cada una de las 10 categorías listadas abajo
- Cada insight DEBE tener un "title" (máximo 8 palabras, directo) y un "text" LARGO y DETALLADO
- El "text" DEBE tener entre 3 y 5 oraciones con:
  * Datos numéricos específicos extraídos de los datos proporcionados
  * Comparaciones (ej: "X es 3 veces mayor que Y", "representa el 40% del total")
  * Análisis de causa raíz o patrón detectado
  * Acción concreta recomendada con pasos específicos
  * Impacto esperado si se toma o no la acción
- NO uses frases genéricas como "revise los datos" o "monitoree la situación"
- Sé ESPECÍFICO: menciona nombres de profesores, cursos, unidades cuando los datos los incluyan
- Todo en español

CATEGORÍAS OBLIGATORIAS:
1. "overall" — estado general: cobertura de análisis, tareas pendientes, salud del sistema
2. "users" — usuarios: ratio activos/inactivos, retención, profesores vs estudiantes
3. "ai_breakdown" — desglose IA: distribución de probabilidades, tendencias, proporción humano vs IA
4. "deadlines" — fechas: vencidas, por vencer, riesgo de acumulación
5. "teachers" — profesores: carga de trabajo, quién tiene más IA, disparidades entre profesores
6. "units" — unidades: distribución de tareas, concentración en unidades, IA por unidad
7. "courses" — cursos: ranking por IA y tardías, cursos problemáticos, comparativas
8. "quizzes" — quizzes: rendimiento, patrones de calificación, áreas de mejora
9. "late_submissions" — entregas tardías: magnitud del problema, patrones, correlación con IA
10. "ai_assignments" — detecciones IA: entregas más sospechosas, severidad, acciones necesarias

FORMATO JSON (responde SOLO esto, sin markdown):
{
  "insights": [
    {
      "id": "ins_1",
      "type": "warning",
      "title": "Título Corto Directo",
      "text": "Texto detallado de 3-5 oraciones con datos específicos, análisis de causa, comparaciones numéricas y recomendación concreta con impacto esperado.",
      "category": "overall",
      "priority": 1
    }
  ]
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4000,
          topP: 0.85,
          topK: 40,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = extractText(data);
    const clean = cleanJson(text);
    const parsed = JSON.parse(clean);

    return {
      insights: parsed.insights || [],
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Gemini insights error:", error);
    return generateFallbackInsights(stats, breakdown, userCounts, coursesByAI);
  }
}

function extractText(res: any): string {
  try {
    return res?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
  } catch {
    return "{}";
  }
}

function cleanJson(s: string): string {
  let c = s.trim();
  if (c.startsWith("```json")) c = c.substring(7);
  else if (c.startsWith("```")) c = c.substring(3);
  if (c.endsWith("```")) c = c.substring(0, c.length - 3);
  return c.trim();
}

// ─────────────────────────────────────────────────────────────
// Fallback — detailed rule-based insights
// ─────────────────────────────────────────────────────────────

function generateFallbackInsights(
  stats: AdminStatsDTO,
  breakdown: AIStatsBreakdownDTO | null,
  userCounts: UserCountDTO | null,
  coursesByAI: CourseAIStatsDTO[] | null
): AIInsightsResponse {
  const insights: AIInsight[] = [];
  let p = 1;

  // overall
  const pctAnalyzed = Number(stats.overallStats.percentageAnalyzed ?? 0);
  insights.push({
    id: `fb_${p}`, priority: p++, category: "overall",
    type: stats.overallStats.totalPending > 20 ? "warning" : pctAnalyzed > 90 ? "positive" : "recommendation",
    title: pctAnalyzed > 90 ? "Alta Cobertura de Análisis" : "Entregas Pendientes de Análisis",
    text: `El sistema ha analizado ${stats.overallStats.totalAnalyzed} de ${stats.overallStats.totalAssignments} tareas totales, alcanzando una cobertura del ${pctAnalyzed.toFixed(0)}%. Actualmente hay ${stats.overallStats.totalPending} entregas pendientes de procesamiento por el motor de detección de IA. De las ${stats.assignmentStats.totalActive} tareas activas, ${stats.assignmentStats.totalGroupAssignments} son grupales y ${stats.assignmentStats.totalIndividualAssignments} individuales. ${stats.overallStats.totalPending > 10 ? "Se recomienda verificar el estado del servicio de análisis Gemini y revisar la cola de procesamiento para asegurar que no haya cuellos de botella." : "El sistema está procesando las entregas de manera eficiente; continúe monitoreando para mantener este nivel."}`,
  });

  // users
  if (userCounts) {
    const inactStu = userCounts.totalStudents - userCounts.totalActiveStudents;
    const inactTea = userCounts.totalTeachers - userCounts.totalActiveTeachers;
    const stuPct = userCounts.totalStudents > 0 ? ((inactStu / userCounts.totalStudents) * 100).toFixed(1) : "0";
    const ratio = userCounts.totalTeachers > 0 ? (userCounts.totalStudents / userCounts.totalTeachers).toFixed(0) : "N/A";
    insights.push({
      id: `fb_${p}`, priority: p++, category: "users",
      type: inactStu > 10 ? "warning" : inactStu > 0 ? "recommendation" : "positive",
      title: inactStu > 0 ? `${inactStu} Estudiantes Inactivos` : "Todos los Usuarios Activos",
      text: `La plataforma tiene ${userCounts.totalStudents} estudiantes y ${userCounts.totalTeachers} profesores registrados, con un ratio de ${ratio} estudiantes por profesor. ${inactStu > 0 ? `El ${stuPct}% de los estudiantes (${inactStu}) están inactivos, lo que podría indicar deserción o falta de seguimiento.` : "Todos los estudiantes están activos, lo cual es excelente."} ${inactTea > 0 ? `También hay ${inactTea} profesor(es) inactivo(s) que podrían necesitar reactivación o reasignación de cursos.` : ""} ${inactStu > 5 ? "Se recomienda implementar un sistema de alertas automáticas para contactar estudiantes que no han ingresado en los últimos 7 días y verificar si necesitan apoyo académico." : "Mantenga el monitoreo semanal de actividad para detectar inactividad tempranamente."}`,
    });
  } else {
    insights.push({ id: `fb_${p}`, priority: p++, category: "users", type: "recommendation", title: "Datos de Usuarios No Disponibles", text: "No se pudieron cargar los datos de conteo de usuarios. Verifique que el endpoint /api/admin/stats/user-counts esté respondiendo correctamente y que la base de datos sea accesible." });
  }

  // ai_breakdown
  if (breakdown) {
    const avg = Number(breakdown.averageAIProbability);
    const totalWithAI = breakdown.countFullAI + breakdown.countHighAI + breakdown.countLowAI;
    const pctWithAny = breakdown.totalSubmissions > 0 ? ((totalWithAI / breakdown.totalSubmissions) * 100).toFixed(1) : "0";
    insights.push({
      id: `fb_${p}`, priority: p++, category: "ai_breakdown",
      type: avg > 40 ? "critical" : avg > 25 ? "warning" : avg > 10 ? "recommendation" : "positive",
      title: avg > 40 ? "Nivel Crítico de Uso de IA" : avg > 25 ? "Uso Elevado de IA" : "Uso Moderado de IA",
      text: `El promedio de probabilidad de IA en las entregas es del ${avg.toFixed(1)}%, con ${totalWithAI} entregas (${pctWithAny}%) mostrando algún nivel de uso de IA. De estas, ${breakdown.countFullAI} fueron identificadas como 100% generadas por IA y ${breakdown.countHighAI} tienen un uso alto (50-99%). Solo ${breakdown.countHuman} entregas (${Number(breakdown.percentageHuman).toFixed(1)}%) fueron clasificadas como completamente humanas. ${avg > 30 ? "Esta proporción es preocupante y sugiere que los estudiantes están dependiendo excesivamente de herramientas de IA. Se recomienda revisar las políticas de integridad académica, implementar evaluaciones presenciales complementarias y hablar con los profesores cuyos cursos tienen mayor incidencia." : "El nivel actual es manejable, pero se recomienda establecer un umbral máximo aceptable y monitorear tendencias semanales para detectar incrementos tempranos."}`,
    });
  } else {
    insights.push({ id: `fb_${p}`, priority: p++, category: "ai_breakdown", type: "recommendation", title: "Sin Datos de Análisis IA", text: "El desglose de IA no está disponible. Esto puede deberse a que aún no se han procesado entregas o a que el servicio de detección está deshabilitado. Verifique la configuración del proveedor de IA en application.yml y asegúrese de que SUBMISSION_AI_ANALYSIS_ENABLED esté en true." });
  }

  // deadlines
  const totalDeadline = stats.deadlineStats.overdue + stats.deadlineStats.dueSoon + stats.deadlineStats.upcoming;
  const overduePct = totalDeadline > 0 ? ((stats.deadlineStats.overdue / totalDeadline) * 100).toFixed(0) : "0";
  insights.push({
    id: `fb_${p}`, priority: p++, category: "deadlines",
    type: stats.deadlineStats.overdue > 5 ? "critical" : stats.deadlineStats.overdue > 0 ? "warning" : "positive",
    title: stats.deadlineStats.overdue > 0 ? `${stats.deadlineStats.overdue} Tareas Vencidas` : "Fechas al Día",
    text: `De ${totalDeadline} tareas con fechas asignadas, ${stats.deadlineStats.overdue} están vencidas (${overduePct}%), ${stats.deadlineStats.dueSoon} están por vencer próximamente y ${stats.deadlineStats.upcoming} están programadas a futuro. ${stats.deadlineStats.overdue > 0 ? `Las ${stats.deadlineStats.overdue} tareas vencidas representan entregas que los estudiantes no completaron a tiempo, lo que puede impactar calificaciones y progreso académico. Se recomienda que los profesores contacten directamente a los estudiantes con tareas vencidas, evalúen la posibilidad de extensiones de plazo y revisen si la carga de trabajo es apropiada.` : "No hay tareas vencidas, lo que indica buen cumplimiento de plazos."} ${stats.deadlineStats.dueSoon > 3 ? `Con ${stats.deadlineStats.dueSoon} tareas por vencer pronto, considere enviar recordatorios automatizados a los estudiantes para prevenir nuevas entregas tardías.` : ""}`,
  });

  // teachers
  if (stats.teacherStats?.length > 0) {
    const sorted = [...stats.teacherStats].sort((a, b) => b.totalAssignments - a.totalAssignments);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    const highAI = [...stats.teacherStats].sort((a, b) => b.averageAIProbability - a.averageAIProbability)[0];
    const avgTasks = sorted.reduce((s, t) => s + t.totalAssignments, 0) / sorted.length;
    insights.push({
      id: `fb_${p}`, priority: p++, category: "teachers",
      type: Number(highAI.averageAIProbability) > 50 ? "warning" : "recommendation",
      title: `Disparidad entre Profesores`,
      text: `${top.teacherName} lidera con ${top.totalAssignments} tareas creadas, mientras que ${bottom.teacherName} tiene solo ${bottom.totalAssignments}, una diferencia de ${top.totalAssignments - bottom.totalAssignments} tareas (promedio: ${avgTasks.toFixed(0)} por profesor). En cuanto a detección de IA, ${highAI.teacherName} tiene el promedio más alto con ${Number(highAI.averageAIProbability).toFixed(1)}% y ${highAI.aiDetectedCount} entregas marcadas. ${Number(highAI.averageAIProbability) > 40 ? `Esto sugiere que los estudiantes de ${highAI.teacherName} podrían estar usando herramientas de IA más frecuentemente; se recomienda que este profesor revise sus métodos de evaluación e implemente controles adicionales como presentaciones orales o exámenes presenciales.` : "La distribución de IA entre profesores es razonablemente equilibrada."} Considere redistribuir la carga de trabajo si la disparidad entre ${top.teacherName} y ${bottom.teacherName} refleja desequilibrios de responsabilidades.`,
    });
  } else {
    insights.push({ id: `fb_${p}`, priority: p++, category: "teachers", type: "recommendation", title: "Sin Datos de Profesores", text: "No hay información disponible sobre el desempeño de profesores. Esto podría indicar que no se han asignado tareas aún o que los datos no están sincronizados correctamente con el módulo de estadísticas." });
  }

  // units
  if (stats.assignmentStats.assignmentsByUnit?.length > 0) {
    const units = stats.assignmentStats.assignmentsByUnit;
    const sorted = [...units].sort((a, b) => b.count - a.count);
    const most = sorted[0];
    const least = sorted[sorted.length - 1];
    const totalTasks = units.reduce((s, u) => s + u.count, 0);
    const highAIUnit = [...units].sort((a, b) => b.averageAIProbability - a.averageAIProbability)[0];
    insights.push({
      id: `fb_${p}`, priority: p++, category: "units",
      type: Number(highAIUnit.averageAIProbability) > 40 ? "warning" : "recommendation",
      title: `${most.unitName} Concentra Más Tareas`,
      text: `${most.unitName} tiene ${most.count} tareas (${((most.count / totalTasks) * 100).toFixed(0)}% del total), mientras que ${least.unitName} tiene solo ${least.count}. Hay ${units.length} unidades activas con un total de ${totalTasks} tareas distribuidas. La unidad con mayor promedio de IA es ${highAIUnit.unitName} con ${Number(highAIUnit.averageAIProbability).toFixed(1)}%, lo que podría indicar que el contenido de esa unidad es más susceptible a ser resuelto con herramientas de IA. Se recomienda revisar los tipos de actividades en ${highAIUnit.unitName} y considerar preguntas de análisis crítico o aplicación práctica que sean más difíciles de generar automáticamente.`,
    });
  } else {
    insights.push({ id: `fb_${p}`, priority: p++, category: "units", type: "recommendation", title: "Sin Datos por Unidad", text: "No hay información de distribución por unidades. Las tareas podrían no estar organizadas por unidades temáticas o los datos no se están agrupando correctamente en el backend." });
  }

  // courses
  if (coursesByAI?.length) {
    const worst = coursesByAI[0];
    const avgAI = coursesByAI.reduce((s, c) => s + Number(c.aiPercentage), 0) / coursesByAI.length;
    const avgLate = coursesByAI.reduce((s, c) => s + Number(c.latePercentage), 0) / coursesByAI.length;
    const highLate = [...coursesByAI].sort((a, b) => Number(b.latePercentage) - Number(a.latePercentage))[0];
    insights.push({
      id: `fb_${p}`, priority: p++, category: "courses",
      type: Number(worst.aiPercentage) > 50 ? "critical" : Number(worst.aiPercentage) > 30 ? "warning" : "recommendation",
      title: `"${worst.courseName}" Lidera en IA`,
      text: `"${worst.courseName}" (Prof. ${worst.teacherName}) tiene el mayor porcentaje de IA con ${Number(worst.aiPercentage).toFixed(1)}% (${worst.aiDetectedSubmissions} de ${worst.totalSubmissions} entregas). El promedio general de IA entre los ${coursesByAI.length} cursos es ${avgAI.toFixed(1)}%, y el de entregas tardías es ${avgLate.toFixed(1)}%. El curso con más entregas tardías es "${highLate.courseName}" con ${Number(highLate.latePercentage).toFixed(1)}% (${highLate.lateSubmissions} entregas). Se recomienda una reunión con ${worst.teacherName} para revisar las entregas marcadas, evaluar si el tipo de tarea facilita el uso de IA, y considerar ajustes en la metodología de evaluación como entregas escalonadas o defensas orales.`,
    });
  } else {
    insights.push({ id: `fb_${p}`, priority: p++, category: "courses", type: "recommendation", title: "Sin Datos de Cursos", text: "No hay información de ranking de cursos. Verifique que los cursos tengan entregas registradas y que el endpoint /api/admin/stats/courses/by-ai esté funcionando." });
  }

  // quizzes
  insights.push({
    id: `fb_${p}`, priority: p++, category: "quizzes", type: "recommendation",
    title: "Análisis de Rendimiento en Quizzes",
    text: `Los quizzes son una herramienta valiosa para evaluar comprensión real ya que se realizan bajo condiciones controladas. Analice las calificaciones más altas para identificar patrones: si los mismos estudiantes consistentemente obtienen las mejores notas, esto valida su aprendizaje. Compare el rendimiento en quizzes con las probabilidades de IA en tareas: estudiantes con alto uso de IA pero bajo rendimiento en quizzes podrían estar dependiendo de herramientas externas sin aprender realmente. Se recomienda implementar quizzes como complemento obligatorio para tareas con alta detección de IA.`,
  });

  // late_submissions
  insights.push({
    id: `fb_${p}`, priority: p++, category: "late_submissions",
    type: stats.deadlineStats.overdue > 3 ? "warning" : "recommendation",
    title: "Patrones de Entregas Tardías",
    text: `Las entregas tardías son un indicador importante de gestión del tiempo y carga académica. Analice la correlación entre minutos de retraso y probabilidad de IA: si las entregas más tardías también tienen alto porcentaje de IA, podría indicar que los estudiantes recurren a herramientas de IA como solución de último momento cuando se les acaba el tiempo. Se recomienda identificar a los estudiantes con entregas tardías recurrentes, contactarlos para entender las causas (sobrecarga, dificultad del contenido, problemas personales) y considerar ajustar plazos o implementar entregas parciales progresivas.`,
  });

  // ai_assignments
  if (breakdown) {
    const critical = breakdown.countFullAI + breakdown.countHighAI;
    insights.push({
      id: `fb_${p}`, priority: p++, category: "ai_assignments",
      type: critical > 5 ? "warning" : critical > 0 ? "recommendation" : "positive",
      title: critical > 0 ? `${critical} Entregas con IA Alta/Total` : "Sin Alertas de IA Graves",
      text: `Se han identificado ${breakdown.countFullAI} entregas como completamente generadas por IA (100%) y ${breakdown.countHighAI} con uso alto (50-99%), sumando ${critical} entregas que requieren revisión prioritaria. ${critical > 0 ? `Estas entregas están ordenadas por probabilidad descendente; comience la revisión por las de mayor porcentaje. Para cada entrega marcada, compare con el historial de entregas del mismo estudiante: un cambio abrupto en estilo de escritura o calidad podría confirmar el uso de herramientas de IA.` : "No hay entregas con niveles preocupantes de IA detectada."} ${critical > 10 ? "Dado el alto volumen, considere priorizar la revisión por curso y establecer un protocolo formal de revisión con los profesores." : "Mantenga el monitoreo continuo y revise periódicamente los umbrales de detección."}`,
    });
  } else {
    insights.push({ id: `fb_${p}`, priority: p++, category: "ai_assignments", type: "recommendation", title: "Sin Datos de Detección", text: "No hay datos de detección de IA disponibles. Verifique que el servicio de análisis esté activo y procesando entregas correctamente." });
  }

  return { insights, generatedAt: new Date().toISOString() };
}