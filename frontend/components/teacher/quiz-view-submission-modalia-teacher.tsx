
import { MonitorCheck } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";


interface SegmentoDetectado {
    start: number;
    end: number;
    probability: string;
}

interface PropsModalSegmentosIA {
    isOpen: boolean;
    onClose: () => void;
    segments: SegmentoDetectado[];
    submissionContent: string;
}

export const ModalSegmentosIA: React.FC<PropsModalSegmentosIA> = ({ isOpen, onClose, segments, submissionContent }) => {
    if (!isOpen) return null;

    const obtenerContenidoResaltado = (inicio: number, fin: number) => {
        const pre = submissionContent.substring(0, inicio);
        const segmento = submissionContent.substring(inicio, fin);
        const post = submissionContent.substring(fin);

        return (
            <p className="whitespace-pre-wrap text-sm border p-3 rounded bg-gray-50 dark:bg-gray-700">
                {pre}
                <span className="font-bold bg-destructive/50 text-destructive p-0.5 rounded-sm transition-all duration-300">
                    {segmento}
                </span>
                {post}
            </p>
        );
    };
return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity p-4">
    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
      {/* Encabezado */}
      <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-card z-10">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-primary">
          <MonitorCheck className="h-5 w-5" />
          Revisión de Segmentos IA
        </h2>
        <Button onClick={onClose} variant="ghost" size="sm">
          Cerrar
        </Button>
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-6 space-y-4">
        {segments.length === 0 ? (
          <p className="text-muted-foreground italic text-sm">
            No se encontraron segmentos específicos detectados por IA.
          </p>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {segments.map((segmento, indice) => (
              <div 
                key={indice} 
                className="border-l-4 border-destructive/50 pl-3 sm:pl-4 py-2 sm:py-3 rounded-r-lg bg-card/50"
              >
                <p className="font-semibold text-sm mb-2 text-foreground">
                  Segmento {indice + 1}:{" "}
                  <span className="text-accent font-bold">
                    {Math.round(parseFloat(segmento.probability) * 100)}%
                  </span>{" "}
                  Probabilidad IA
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Rango de Caracteres: {segmento.start} a {segmento.end}
                </p>
                <div className="text-xs sm:text-sm text-foreground">
                  {obtenerContenidoResaltado(segmento.start, segmento.end)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  </div>
);
};