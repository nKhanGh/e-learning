"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Bold,
  Code2,
  Columns2,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Pencil,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import { useRef, useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

type EditorMode = "write" | "preview" | "split";

export type RichMarkdownEditorLabels = {
  write: string;
  preview: string;
  split: string;
  paragraph: string;
  heading1: string;
  heading2: string;
  heading3: string;
  bold: string;
  italic: string;
  underline: string;
  strike: string;
  inlineCode: string;
  codeBlock: string;
  bulletList: string;
  numberedList: string;
  quote: string;
  link: string;
  divider: string;
  writingGuide: string;
  guideHeading: string;
  guideList: string;
  guideEmphasis: string;
  guideCode: string;
  emptyPreview: string;
};

type RichMarkdownEditorProps = {
  id?: string;
  label?: string;
  value: string;
  placeholder?: string;
  className?: string;
  labels: RichMarkdownEditorLabels;
  onChange: (value: string) => void;
};

const defaultSelection = "text";

export function RichMarkdownEditor({
  id,
  label,
  value,
  placeholder,
  className,
  labels,
  onChange,
}: RichMarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<EditorMode>("write");

  const updateValue = (
    nextValue: string,
    selectionStart: number,
    selectionEnd: number,
  ) => {
    onChange(nextValue);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const getSelection = () => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selected = value.slice(start, end);

    return { start, end, selected };
  };

  const wrapSelection = (before: string, after = before, fallback = defaultSelection) => {
    const { start, end, selected } = getSelection();
    const content = selected || fallback;
    const next = `${value.slice(0, start)}${before}${content}${after}${value.slice(end)}`;
    const nextStart = start + before.length;

    updateValue(next, nextStart, nextStart + content.length);
  };

  const insertBlock = (before: string, after = "", fallback = defaultSelection) => {
    const { start, end, selected } = getSelection();
    const needsLeadingBreak = start > 0 && value[start - 1] !== "\n";
    const needsTrailingBreak = end < value.length && value[end] !== "\n";
    const content = selected || fallback;
    const insertion = `${needsLeadingBreak ? "\n" : ""}${before}${content}${after}${needsTrailingBreak ? "\n" : ""}`;
    const next = `${value.slice(0, start)}${insertion}${value.slice(end)}`;
    const nextStart = start + (needsLeadingBreak ? 1 : 0) + before.length;

    updateValue(next, nextStart, nextStart + content.length);
  };

  const prefixSelectedLines = (prefix: string, fallback = defaultSelection) => {
    const { start, end, selected } = getSelection();
    const content = selected || fallback;
    const prefixed = content
      .split("\n")
      .map((line) => `${prefix}${line.replace(/^#{1,3}\s+/, "")}`)
      .join("\n");
    const next = `${value.slice(0, start)}${prefixed}${value.slice(end)}`;

    updateValue(next, start + prefix.length, start + prefixed.length);
  };

  const makeParagraph = () => {
    const { start, end, selected } = getSelection();
    const content = (selected || defaultSelection)
      .split("\n")
      .map((line) => line.replace(/^#{1,3}\s+/, ""))
      .join("\n");
    const next = `${value.slice(0, start)}${content}${value.slice(end)}`;

    updateValue(next, start, start + content.length);
  };

  const addLink = () => {
    const href = window.prompt("https://");
    if (!href) return;

    const { start, end, selected } = getSelection();
    const text = selected || "link text";
    const insertion = `[${text}](${href})`;
    const next = `${value.slice(0, start)}${insertion}${value.slice(end)}`;

    updateValue(next, start + 1, start + 1 + text.length);
  };

  const toolbarButtonClass = "h-8 px-2 text-xs";

  const editor = (
    <Textarea
      id={id}
      ref={textareaRef}
      className="min-h-80 rounded-none border-0 font-mono text-xs leading-6 shadow-none focus:border-transparent focus:ring-0"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );

  const preview = (
    <div className="min-h-80 bg-white p-4 dark:bg-bg">
      <MarkdownRenderer content={value} emptyText={labels.emptyPreview} />
    </div>
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-border dark:bg-bg">
        <div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50 p-2 dark:border-border dark:bg-surface">
          <div className="flex flex-wrap items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.paragraph}
              onClick={makeParagraph}
            >
              {labels.paragraph}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.heading1}
              onClick={() => prefixSelectedLines("# ", labels.heading1)}
            >
              <Heading1 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.heading2}
              onClick={() => prefixSelectedLines("## ", labels.heading2)}
            >
              <Heading2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.heading3}
              onClick={() => prefixSelectedLines("### ", labels.heading3)}
            >
              <Heading3 className="h-3.5 w-3.5" />
            </Button>
            <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-border" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.bold}
              onClick={() => wrapSelection("**", "**", labels.bold)}
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.italic}
              onClick={() => wrapSelection("*", "*", labels.italic)}
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.underline}
              onClick={() => wrapSelection("<u>", "</u>", labels.underline)}
            >
              <Underline className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.strike}
              onClick={() => wrapSelection("~~", "~~", labels.strike)}
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.inlineCode}
              onClick={() => wrapSelection("`", "`", "code")}
            >
              <Code2 className="h-3.5 w-3.5" />
            </Button>
            <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-border" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.bulletList}
              onClick={() => prefixSelectedLines("- ", "List item")}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.numberedList}
              onClick={() => prefixSelectedLines("1. ", "List item")}
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.quote}
              onClick={() => prefixSelectedLines("> ", labels.quote)}
            >
              <Quote className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.link}
              onClick={addLink}
            >
              <Link className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.codeBlock}
              onClick={() => insertBlock("```js\n", "\n```", "console.log('hello');")}
            >
              {"{ }"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={toolbarButtonClass}
              title={labels.divider}
              onClick={() => insertBlock("", "\n---\n", "")}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as EditorMode)}
            className="gap-0"
          >
            <TabsList className="h-8 w-fit">
              <TabsTrigger value="write" className="h-6 px-2 text-xs">
                <Pencil className="h-3.5 w-3.5" />
                {labels.write}
              </TabsTrigger>
              <TabsTrigger value="preview" className="h-6 px-2 text-xs">
                <Eye className="h-3.5 w-3.5" />
                {labels.preview}
              </TabsTrigger>
              <TabsTrigger value="split" className="h-6 px-2 text-xs">
                <Columns2 className="h-3.5 w-3.5" />
                {labels.split}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {mode === "split" ? (
          <div className="grid min-h-80 md:grid-cols-2">
            <div className="border-b border-gray-100 dark:border-border md:border-b-0 md:border-r">
              {editor}
            </div>
            {preview}
          </div>
        ) : null}

        {mode === "write" ? editor : null}
        {mode === "preview" ? preview : null}
      </div>

      <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-xs leading-5 text-gray-600 dark:border-border dark:bg-bg dark:text-muted">
        <p className="font-semibold text-gray-900 dark:text-text">
          {labels.writingGuide}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>{labels.guideHeading}</li>
          <li>{labels.guideList}</li>
          <li>{labels.guideEmphasis}</li>
          <li>{labels.guideCode}</li>
        </ul>
      </div>
    </div>
  );
}
