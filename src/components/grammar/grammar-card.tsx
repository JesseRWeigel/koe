import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GrammarExplanation } from "./grammar-explainer";

const LANGUAGE_LABELS: Record<string, string> = {
  ja: "Japanese",
  es: "Spanish",
  "pt-BR": "Portuguese",
};

interface GrammarCardProps {
  item: GrammarExplanation;
}

export function GrammarCard({ item }: GrammarCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="flex-1">{item.text}</CardTitle>
          <Badge variant="secondary">
            {LANGUAGE_LABELS[item.language] ?? item.language}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
          {item.explanation}
        </div>
      </CardContent>
    </Card>
  );
}
