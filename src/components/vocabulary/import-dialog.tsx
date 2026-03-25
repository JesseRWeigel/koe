"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, FileUp, CheckCircle } from "lucide-react";
import {
  parseAnkiExport,
  mapToVocabulary,
  type ImportedCard,
  type ImportMapping,
} from "@/lib/import";
import type { NewVocabularyItem } from "@/lib/vocabulary/store";

const LANGUAGES = [
  { code: "ja", label: "Japanese" },
  { code: "es", label: "Spanish" },
  { code: "pt-BR", label: "Portuguese" },
] as const;

const FIELD_OPTIONS = [
  { value: "skip", label: "Skip" },
  { value: "word", label: "Word" },
  { value: "reading", label: "Reading" },
  { value: "meaning", label: "Meaning" },
] as const;

interface ImportDialogProps {
  onImport: (items: NewVocabularyItem[]) => void;
  defaultLanguage?: "ja" | "es" | "pt-BR";
}

export function ImportDialog({
  onImport,
  defaultLanguage = "ja",
}: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [cards, setCards] = useState<ImportedCard[]>([]);
  const [columnMappings, setColumnMappings] = useState<string[]>([]);
  const [languageCode, setLanguageCode] = useState<"ja" | "es" | "pt-BR">(
    defaultLanguage
  );
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const resetState = useCallback(() => {
    setCards([]);
    setColumnMappings([]);
    setLanguageCode(defaultLanguage);
    setImportedCount(null);
    setFileName("");
  }, [defaultLanguage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportedCount(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseAnkiExport(text);
      setCards(parsed);

      // Auto-assign column mappings based on column count
      if (parsed.length > 0) {
        const colCount = parsed[0].fields.length;
        const mappings: string[] = new Array(colCount).fill("skip");
        if (colCount >= 1) mappings[0] = "word";
        if (colCount >= 2) mappings[1] = "reading";
        if (colCount >= 3) mappings[2] = "meaning";
        // If only 2 columns, second is meaning not reading
        if (colCount === 2) {
          mappings[1] = "meaning";
        }
        setColumnMappings(mappings);
      }
    };
    reader.readAsText(file);
  };

  const handleColumnMapping = (index: number, value: string | null) => {
    if (!value) return;
    setColumnMappings((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const buildMapping = (): ImportMapping | null => {
    const wordIdx = columnMappings.indexOf("word");
    const meaningIdx = columnMappings.indexOf("meaning");
    const readingIdx = columnMappings.indexOf("reading");

    if (wordIdx === -1 || meaningIdx === -1) return null;

    return {
      wordField: wordIdx,
      readingField: readingIdx === -1 ? null : readingIdx,
      meaningField: meaningIdx,
    };
  };

  const handleImport = () => {
    const mapping = buildMapping();
    if (!mapping) return;

    const items = mapToVocabulary(cards, mapping, languageCode);
    onImport(items);
    setImportedCount(items.length);
  };

  const mapping = buildMapping();
  const previewCards = cards.slice(0, 5);
  const columnCount = cards[0]?.fields.length ?? 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetState();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline">
            <Upload />
            Import
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Vocabulary</DialogTitle>
          <DialogDescription>
            Import vocabulary from an Anki deck export (CSV/TSV file).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* File upload */}
          <div className="grid gap-2">
            <Label htmlFor="import-file">File</Label>
            <label
              htmlFor="import-file"
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30"
            >
              <FileUp className="size-4" />
              {fileName || "Choose a .csv, .tsv, or .txt file"}
              <input
                id="import-file"
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          {/* Language selector */}
          <div className="grid gap-2">
            <Label htmlFor="import-language">Language</Label>
            <Select
              value={languageCode}
              onValueChange={(val: string | null) => {
                if (val) setLanguageCode(val as "ja" | "es" | "pt-BR");
              }}
            >
              <SelectTrigger className="w-full" id="import-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Column mapping */}
          {cards.length > 0 && (
            <div className="grid gap-2">
              <Label>Column Mapping</Label>
              <div className="flex gap-2">
                {Array.from({ length: columnCount }, (_, i) => (
                  <div key={i} className="flex-1">
                    <Select
                      value={columnMappings[i] ?? "skip"}
                      onValueChange={(val: string | null) =>
                        handleColumnMapping(i, val)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {previewCards.length > 0 && (
            <div className="grid gap-2">
              <Label>
                Preview ({Math.min(5, cards.length)} of {cards.length} rows)
              </Label>
              <div className="overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Array.from({ length: columnCount }, (_, i) => (
                        <TableHead key={i}>
                          {columnMappings[i] === "skip"
                            ? `Column ${i + 1}`
                            : columnMappings[i]?.charAt(0).toUpperCase() +
                              columnMappings[i]?.slice(1)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewCards.map((card, rowIdx) => (
                      <TableRow key={rowIdx}>
                        {card.fields.map((field, colIdx) => (
                          <TableCell key={colIdx} className="max-w-48 truncate">
                            {field}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Success message */}
          {importedCount !== null && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
              <CheckCircle className="size-4" />
              Successfully imported {importedCount}{" "}
              {importedCount === 1 ? "word" : "words"}.
            </div>
          )}
        </div>

        <DialogFooter>
          {importedCount === null ? (
            <Button
              onClick={handleImport}
              disabled={!mapping || cards.length === 0}
            >
              Import {cards.length > 0 ? `${cards.length} words` : ""}
            </Button>
          ) : (
            <Button
              onClick={() => {
                setOpen(false);
                resetState();
              }}
            >
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
