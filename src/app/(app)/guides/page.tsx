"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/lib/context/language-context";
import { getGuide } from "@/data/guides";
import { codeToLabel } from "@/lib/languages";

export default function GuidesPage() {
  const { language } = useLanguage();
  const guide = getGuide(language);
  const languageLabel = codeToLabel(language);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Guides</h1>
      </header>
      <main className="flex flex-1 flex-col gap-8 p-6">
        {guide ? (
          <>
            <p className="text-muted-foreground text-sm">
              Learning guide for {languageLabel}
            </p>
            {guide.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">
                  {renderMarkdown(section.content)}
                </div>
              </section>
            ))}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              A guide for {languageLabel} is coming soon.
            </p>
          </div>
        )}
      </main>
    </>
  );
}

/**
 * Minimal markdown renderer for guide content.
 * Handles headings, bold, tables, lists, and paragraphs.
 */
function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line — skip
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const Tag = `h${Math.min(level + 2, 6)}` as keyof React.JSX.IntrinsicElements;
      elements.push(
        <Tag key={key++} className="font-semibold mt-2">
          {renderInline(text)}
        </Tag>,
      );
      i++;
      continue;
    }

    // Table — collect all table lines
    if (line.includes("|") && line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(renderTable(tableLines, key++));
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      elements.push(
        <ol key={key++} className="list-decimal list-inside space-y-1">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-1">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Paragraph — collect consecutive non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^#{1,4}\s/) &&
      !lines[i].trim().startsWith("|") &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !/^[-*]\s/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      elements.push(
        <p key={key++}>{renderInline(paraLines.join(" "))}</p>,
      );
    }
  }

  return elements;
}

/** Render inline markdown: **bold** and `code` */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let partKey = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(
        <strong key={partKey++} className="font-semibold">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      parts.push(
        <code
          key={partKey++}
          className="bg-muted rounded px-1 py-0.5 text-sm"
        >
          {match[3]}
        </code>,
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : parts;
}

function renderTable(lines: string[], key: number) {
  const parseRow = (line: string) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0 && !/^[-:]+$/.test(cell));

  const headerCells = parseRow(lines[0]);
  // Skip separator line (index 1)
  const bodyRows = lines.slice(2).map(parseRow);

  return (
    <div key={key} className="overflow-x-auto">
      <table className="text-sm border-collapse w-full">
        <thead>
          <tr className="border-b">
            {headerCells.map((cell, idx) => (
              <th key={idx} className="text-left p-2 font-semibold">
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rowIdx) => (
            <tr key={rowIdx} className="border-b">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="p-2">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
