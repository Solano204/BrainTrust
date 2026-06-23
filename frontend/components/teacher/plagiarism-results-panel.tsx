"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, Clock } from "lucide-react";
import type { PlagiarismCheckDTO } from "@/components/teacher/api/teacher-submission";

interface Props {
  results: PlagiarismCheckDTO[];
}

function similarityColor(pct: string | null): string {
  if (!pct) return "secondary";
  const val = parseFloat(pct);
  if (val >= 70) return "destructive";
  if (val >= 40) return "outline";
  return "secondary";
}

function statusIcon(status: string) {
  if (status === "COMPLETED") return <ShieldCheck className="h-4 w-4 text-green-600" />;
  if (status === "FAILED") return <AlertTriangle className="h-4 w-4 text-destructive" />;
  return <Clock className="h-4 w-4 text-muted-foreground" />;
}

export function PlagiarismResultsPanel({ results }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!results.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Similitud entre entregas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No se encontraron comparaciones de similitud.</p>
        </CardContent>
      </Card>
    );
  }

  const completed = results.filter((r) => r.status === "COMPLETED");
  const highSimilarity = completed.filter((r) => {
    const val = r.overallSimilarityPercentage ? parseFloat(r.overallSimilarityPercentage) : 0;
    return val >= 70;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Similitud entre entregas
          {highSimilarity.length > 0 && (
            <Badge variant="destructive">{highSimilarity.length} alta similitud</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.map((r) => (
          <div key={r.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {statusIcon(r.status)}
                <span className="text-sm font-medium">
                  {r.comparedStudentName ?? r.comparedStudentId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {r.overallSimilarityPercentage && (
                  <Badge variant={similarityColor(r.overallSimilarityPercentage) as "destructive" | "outline" | "secondary"}>
                    {r.overallSimilarityPercentage}
                  </Badge>
                )}
                {r.similarParagraphs.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  >
                    {expanded === r.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {expanded === r.id && r.similarParagraphs.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground">
                  Parrafos similares ({r.similarParagraphs.length})
                </p>
                {r.similarParagraphs.map((p, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 text-xs bg-muted/40 rounded p-2">
                    <div>
                      <p className="font-medium mb-1">Entrega original</p>
                      <p className="text-muted-foreground line-clamp-3">{p.originalText}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">
                        Comparado — {p.similarityPercentage}
                      </p>
                      <p className="text-muted-foreground line-clamp-3">{p.matchedText}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
