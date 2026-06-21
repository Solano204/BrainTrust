"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldAlert,
  BookMarked,
} from "lucide-react";
import {
  fetchStudentHistory,
  fetchPlagiarismResultsForSubmission,
  type StudentHistoryDTO,
  type SubmissionHistoryItemDTO,
  type PlagiarismSummaryDTO,
} from "@/components/teacher/api/teacher-submission";

interface Props {
  courseId: string;
  studentId: string;
  studentName?: string;
  onBack: () => void;
}

// ── helpers ──────────────────────────────────────────────────

function gradePercent(item: SubmissionHistoryItemDTO): number | null {
  if (!item.grade) return null;
  return parseFloat(item.grade.percentage);
}

function aiVal(item: SubmissionHistoryItemDTO): number | null {
  if (!item.aiProbabilityPercentage) return null;
  return parseFloat(item.aiProbabilityPercentage);
}

function aiVariant(pct: number | null): "destructive" | "outline" | "secondary" {
  if (pct === null) return "secondary";
  if (pct >= 70) return "destructive";
  if (pct >= 40) return "outline";
  return "secondary";
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    GRADED: "Calificado",
    SUBMITTED: "Entregado",
    LATE_SUBMITTED: "Tarde",
    NOT_SUBMITTED: "Sin entregar",
  };
  return map[s] ?? s;
}

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "GRADED") return "default";
  if (s === "SUBMITTED") return "secondary";
  if (s === "LATE_SUBMITTED") return "destructive";
  return "outline";
}

// ── unit grouping ─────────────────────────────────────────────

interface UnitGroup {
  unitId: string | null;
  unitName: string | null;
  unitOrder: number;
  items: SubmissionHistoryItemDTO[];
}

function groupByUnit(submissions: SubmissionHistoryItemDTO[]): UnitGroup[] {
  const map = new Map<string, UnitGroup>();
  for (const s of submissions) {
    const key = s.unitId ?? "__none__";
    if (!map.has(key)) {
      map.set(key, {
        unitId: s.unitId,
        unitName: s.unitName,
        unitOrder: s.unitOrder,
        items: [],
      });
    }
    map.get(key)!.items.push(s);
  }
  return [...map.values()].sort((a, b) => a.unitOrder - b.unitOrder);
}

// Sort within each unit by submittedAt ascending (oldest first)
function sortByDate(items: SubmissionHistoryItemDTO[]) {
  return [...items].sort((a, b) => {
    if (!a.submittedAt) return 1;
    if (!b.submittedAt) return -1;
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });
}

// ── trend between units ───────────────────────────────────────

function UnitTrend({ prev, curr }: { prev: UnitGroup; curr: UnitGroup }) {
  const avgGrade = (g: UnitGroup) => {
    const vals = g.items.map(gradePercent).filter((v): v is number => v !== null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };
  const p = avgGrade(prev);
  const c = avgGrade(curr);
  if (p === null || c === null) return null;
  const diff = c - p;
  if (Math.abs(diff) < 2) {
    return (
      <div className="flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        Sin cambio significativo entre unidades
      </div>
    );
  }
  return (
    <div
      className={`flex items-center justify-center gap-1 py-2 text-xs font-medium ${
        diff > 0 ? "text-green-600" : "text-destructive"
      }`}
    >
      {diff > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {diff > 0 ? "Mejoró" : "Bajó"} {Math.abs(diff).toFixed(1)}% promedio respecto a la unidad anterior
    </div>
  );
}

// ── plagiarism match row (lazy-loads paragraph pairs) ─────────

function PlagiarismMatchRow({
  match,
  submissionId,
}: {
  match: PlagiarismSummaryDTO;
  submissionId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const pct = parseFloat(match.overallSimilarityPercentage ?? "0");

  const { data: check, isLoading } = useQuery({
    queryKey: ["plagiarism-check", match.plagiarismCheckId],
    queryFn: () => fetchPlagiarismResultsForSubmission(submissionId),
    enabled: expanded,
    staleTime: 1000 * 60 * 10,
    select: (data) => data.find((c) => c.id === match.plagiarismCheckId),
  });

  return (
    <div className="bg-card border rounded-md overflow-hidden text-xs">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-2.5 hover:bg-muted/50 transition-colors"
      >
        <span className="text-muted-foreground font-medium">
          {match.comparedStudentName ?? match.comparedStudentId}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{match.similarParagraphsCount} párrafos</span>
          <Badge
            variant={pct >= 70 ? "destructive" : pct >= 40 ? "outline" : "secondary"}
            className="text-xs"
          >
            {match.overallSimilarityPercentage ?? "–"}
          </Badge>
          {expanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t p-2.5 space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-2">Cargando párrafos...</p>
          ) : check?.similarParagraphs?.length ? (
            check.similarParagraphs.map((para, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground">
                    Párrafo {para.paragraphIndex + 1}
                  </span>
                  {para.similarityPercentage && (
                    <Badge variant="outline" className="text-xs">
                      {para.similarityPercentage}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded p-2 space-y-1">
                    <p className="font-semibold text-orange-600 dark:text-orange-400">Este estudiante</p>
                    <p className="leading-relaxed text-foreground">{para.originalText}</p>
                  </div>
                  <div className="bg-muted/30 border rounded p-2 space-y-1">
                    <p className="font-semibold text-muted-foreground">
                      {match.comparedStudentName ?? match.comparedStudentId}
                    </p>
                    <p className="leading-relaxed text-foreground">{para.matchedText}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-2">Sin párrafos similares detallados.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── per-submission card ───────────────────────────────────────

function SubmissionCard({ item }: { item: SubmissionHistoryItemDTO }) {
  const [expanded, setExpanded] = useState(false);
  const ai = aiVal(item);
  const hasAiSegments = item.allSegments?.length > 0;
  const hasPlagiarism = item.plagiarismMatches?.length > 0;
  const hasDetails = hasAiSegments || hasPlagiarism;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* main row */}
        <div className="flex items-start gap-3 p-4">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-foreground">{item.assignmentName}</span>
              <Badge variant={statusVariant(item.status)} className="text-xs">
                {statusLabel(item.status)}
              </Badge>
              {item.isLate && (
                <Badge variant="outline" className="text-xs text-destructive border-destructive/40">
                  Tarde
                </Badge>
              )}
            </div>
            {item.submittedAt && (
              <p className="text-xs text-muted-foreground">
                {new Date(item.submittedAt).toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          {/* right badges */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {item.grade ? (
              <span className="text-sm font-bold text-foreground">
                {item.grade.value}/{item.grade.maxScore}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  ({parseFloat(item.grade.percentage).toFixed(1)}%)
                </span>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Sin calificar</span>
            )}

            {item.hasAiAnalysis && ai !== null && (
              <Badge variant={aiVariant(ai)} className="text-xs gap-1">
                <Brain className="h-3 w-3" />
                IA {ai.toFixed(1)}%
              </Badge>
            )}

            {hasPlagiarism && (() => {
              const highCount = item.plagiarismMatches.filter(
                (m) => parseFloat(m.overallSimilarityPercentage ?? "0") >= 70
              ).length;
              return (
                <Badge variant={highCount > 0 ? "destructive" : "outline"} className="text-xs gap-1">
                  <ShieldAlert className="h-3 w-3" />
                  {highCount > 0 ? `${highCount} alta similitud` : `${item.plagiarismMatches.length} similitudes`}
                </Badge>
              );
            })()}
          </div>
        </div>

        {/* expand toggle */}
        {hasDetails && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/70 transition-colors border-t"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Ocultar detalle" : "Ver párrafos detectados"}
          </button>
        )}

        {/* expanded detail */}
        {expanded && hasDetails && (
          <div className="border-t bg-muted/20 p-4 space-y-4">
            {/* AI and Human segments */}
            {hasAiSegments && (() => {
              const aiSegs = item.allSegments.filter((s) => s.segmentType !== "HUMAN");
              const humanSegs = item.allSegments.filter((s) => s.segmentType === "HUMAN");
              return (
                <div className="space-y-4">
                  {aiSegs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-destructive flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        Generado por IA ({aiSegs.length} fragmento{aiSegs.length !== 1 ? "s" : ""})
                      </p>
                      {aiSegs.map((seg, i) => (
                        <div key={i} className="bg-destructive/5 border border-destructive/20 rounded-md p-2.5 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-muted-foreground">Fragmento {seg.paragraphIndex + 1}</span>
                            {seg.similarityPercentage && (
                              <Badge variant="destructive" className="text-xs">{seg.similarityPercentage}</Badge>
                            )}
                          </div>
                          <p className="text-foreground leading-relaxed">{seg.originalText}</p>
                          {seg.matchedText && (
                            <p className="text-muted-foreground italic">{seg.matchedText}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {humanSegs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Escrito por el estudiante ({humanSegs.length} fragmento{humanSegs.length !== 1 ? "s" : ""})
                      </p>
                      {humanSegs.map((seg, i) => (
                        <div key={i} className="bg-green-500/5 border border-green-500/20 rounded-md p-2.5 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-muted-foreground">Fragmento {seg.paragraphIndex + 1}</span>
                            {seg.similarityPercentage && (
                              <Badge variant="secondary" className="text-xs">{seg.similarityPercentage}</Badge>
                            )}
                          </div>
                          <p className="text-foreground leading-relaxed">{seg.originalText}</p>
                          {seg.matchedText && (
                            <p className="text-muted-foreground italic">{seg.matchedText}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Plagiarism matches */}
            {hasPlagiarism && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-orange-500" />
                  Similitud con otros estudiantes ({item.plagiarismMatches.length})
                </p>
                {item.plagiarismMatches.map((m, i) => (
                  <PlagiarismMatchRow key={i} match={m} submissionId={item.submissionId} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── unit section ──────────────────────────────────────────────

function UnitSection({ group }: { group: UnitGroup }) {
  const sorted = sortByDate(group.items);
  const gradedItems = sorted.filter((s) => s.grade !== null);
  const avgGrade =
    gradedItems.length > 0
      ? gradedItems.reduce((acc, s) => acc + parseFloat(s.grade!.percentage), 0) / gradedItems.length
      : null;
  const aiRisks = sorted.filter((s) => s.isLikelyAI).length;

  return (
    <div className="space-y-3">
      {/* unit header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
            {group.unitOrder || "?"}
          </div>
          <h3 className="font-semibold text-foreground">
            {group.unitName ?? `Unidad ${group.unitOrder || "Sin unidad"}`}
          </h3>
          <span className="text-xs text-muted-foreground">
            · {sorted.length} tarea{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {avgGrade !== null && (
            <span className="text-xs font-medium text-muted-foreground">
              Promedio: <span className="text-foreground">{avgGrade.toFixed(1)}%</span>
            </span>
          )}
          {aiRisks > 0 && (
            <Badge variant="destructive" className="text-xs gap-1">
              <Brain className="h-3 w-3" />
              {aiRisks} IA
            </Badge>
          )}
        </div>
      </div>

      {sorted.map((item) => (
        <SubmissionCard key={item.submissionId} item={item} />
      ))}
    </div>
  );
}

// ── summary stats ─────────────────────────────────────────────

function SummaryStats({ submissions }: { submissions: SubmissionHistoryItemDTO[] }) {
  const graded = submissions.filter((s) => s.grade !== null);
  const avgGrade =
    graded.length > 0
      ? graded.reduce((acc, s) => acc + parseFloat(s.grade!.percentage), 0) / graded.length
      : null;
  const aiDetected = submissions.filter((s) => s.isLikelyAI).length;
  const highPlagiarism = submissions.filter((s) =>
    s.plagiarismMatches.some((m) => parseFloat(m.overallSimilarityPercentage ?? "0") >= 70)
  ).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Entregas", value: submissions.length, icon: <BookOpen className="h-4 w-4" /> },
        {
          label: "Promedio general",
          value: avgGrade !== null ? `${avgGrade.toFixed(1)}%` : "–",
          icon: <CheckCircle2 className="h-4 w-4" />,
        },
        {
          label: "Riesgo IA",
          value: aiDetected,
          icon: <Brain className="h-4 w-4" />,
          highlight: aiDetected > 0,
        },
        {
          label: "Alta similitud",
          value: highPlagiarism,
          icon: <ShieldAlert className="h-4 w-4" />,
          highlight: highPlagiarism > 0,
        },
      ].map((stat, i) => (
        <Card key={i} className="card-base">
          <CardContent className="p-3 flex items-center gap-3">
            <span className={stat.highlight ? "text-destructive" : "text-muted-foreground"}>
              {stat.icon}
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.highlight ? "text-destructive" : "text-foreground"}`}>
                {stat.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── main view ─────────────────────────────────────────────────

export function StudentHistoryView({ courseId, studentId, studentName, onBack }: Props) {
  const { data, isLoading, error } = useQuery<StudentHistoryDTO>({
    queryKey: ["student-history", courseId, studentId],
    queryFn: () => fetchStudentHistory(courseId, studentId),
    staleTime: 1000 * 60 * 5,
  });

  const units = data ? groupByUnit(data.submissions) : [];

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-2 shrink-0">
          <ArrowLeft className="h-4 w-4" />
          Regresar
        </Button>
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            {data?.studentName ?? studentName ?? studentId}
          </h2>
          {data?.courseName && (
            <p className="text-sm text-muted-foreground">{data.courseName}</p>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No se pudo cargar el historial.</p>
          </CardContent>
        </Card>
      )}

      {data && !isLoading && data.submissions.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center space-y-2">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Este estudiante no tiene entregas en el curso.</p>
          </CardContent>
        </Card>
      )}

      {data && !isLoading && data.submissions.length > 0 && (
        <>
          <SummaryStats submissions={data.submissions} />

          <div className="space-y-8">
            {units.map((group, idx) => (
              <div key={group.unitId ?? idx}>
                {idx > 0 && <UnitTrend prev={units[idx - 1]} curr={group} />}
                <UnitSection group={group} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
