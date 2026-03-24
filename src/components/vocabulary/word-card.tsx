"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VocabularyItem } from "@/lib/vocabulary/store";

interface WordCardProps {
  item: VocabularyItem;
  onEdit: (item: VocabularyItem) => void;
  onDelete: (id: string) => void;
}

export function WordCard({ item, onEdit, onDelete }: WordCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          <span className="text-lg">{item.word}</span>
          {item.reading && (
            <span className="text-sm text-muted-foreground">
              {item.reading}
            </span>
          )}
        </CardTitle>
        <CardAction>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(item)}
              aria-label="Edit word"
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(item.id)}
              aria-label="Delete word"
            >
              <Trash2 />
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">{item.meaning}</p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary">{item.partOfSpeech}</Badge>
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Added{" "}
          <time dateTime={item.createdAt.toISOString()}>
            {item.createdAt.toLocaleDateString()}
          </time>
        </p>
      </CardContent>
    </Card>
  );
}
