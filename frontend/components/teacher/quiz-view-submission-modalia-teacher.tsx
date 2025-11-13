import { MonitorCheck } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";


interface DetectedSegment {
    start: number;
    end: number;
    probability: string; // Stored as a string in the example
}

interface AISegmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    segments: DetectedSegment[];
    submissionContent: string;
}

export  const AISegmentsModal: React.FC<AISegmentsModalProps> = ({ isOpen, onClose, segments, submissionContent }) => {
    if (!isOpen) return null;

    // Helper to highlight the text segment
    const getHighlightedContent = (start: number, end: number) => {
        const pre = submissionContent.substring(0, start);
        const segment = submissionContent.substring(start, end);
        const post = submissionContent.substring(end);

        return (
            <p className="whitespace-pre-wrap text-sm border p-3 rounded bg-gray-50 dark:bg-gray-700">
                {pre}
                <span className="font-bold bg-destructive/50 text-destructive p-0.5 rounded-sm transition-all duration-300">
                    {segment}
                </span>
                {post}
            </p>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 dark:bg-gray-800">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                        <MonitorCheck className="h-5 w-5" /> **AI Segment Review**
                    </h2>
                    <Button onClick={onClose} variant="ghost" size="sm">
                        Close
                    </Button>
                </div>

                {segments.length === 0 ? (
                    <p className="text-muted-foreground italic">No specific AI-detected segments found.</p>
                ) : (
                    <div className="space-y-6">
                        {segments.map((segment, index) => (
                            <div key={index} className="border-l-4 border-destructive/50 pl-4">
                                <p className="font-semibold text-sm mb-1">
                                    Segment {index + 1}: **{Math.round(parseFloat(segment.probability) * 100)}%** AI Probability
                                </p>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Character Range: {segment.start} to {segment.end}
                                </p>
                                {getHighlightedContent(segment.start, segment.end)}
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};