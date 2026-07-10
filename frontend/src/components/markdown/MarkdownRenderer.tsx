import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";

type MarkdownRendererProps = {
  content?: string | null;
  className?: string;
  emptyText?: string;
};

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "u",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      ["target"],
      ["rel"],
      ["href"],
      ["title"],
    ],
    code: [...(defaultSchema.attributes?.code ?? []), ["className"]],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
  },
};

const isExternalHref = (href?: string) => Boolean(href?.startsWith("http"));

export function MarkdownRenderer({
  content,
  className,
  emptyText = "Nothing to preview yet.",
}: MarkdownRendererProps) {
  const source = content?.trim() ?? "";

  if (!source) {
    return (
      <div
        className={cn(
          "rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-border dark:text-muted",
          className,
        )}
      >
        {emptyText}
      </div>
    );
  }

  return (
    <article
      className={cn(
        "space-y-3 text-sm leading-7 text-gray-700 dark:text-muted",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold leading-tight text-gray-950 dark:text-text">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold leading-tight text-gray-950 dark:text-text">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold leading-tight text-gray-950 dark:text-text">
              {children}
            </h3>
          ),
          p: ({ children }) => <p>{children}</p>,
          strong: ({ children }) => (
            <strong className="font-bold text-gray-950 dark:text-text">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          u: ({ children }) => (
            <u className="underline underline-offset-2">{children}</u>
          ),
          del: ({ children }) => <s>{children}</s>,
          a: ({ children, href }) => (
            <a
              href={href}
              target={isExternalHref(href) ? "_blank" : undefined}
              rel={isExternalHref(href) ? "noreferrer" : undefined}
              className="font-semibold text-primary underline underline-offset-2"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/40 bg-primary/5 px-4 py-2 italic text-gray-600 dark:text-muted">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-gray-200 dark:border-border" />,
          code: ({ children, className }) => {
            const isBlock = className?.startsWith("language-");

            if (isBlock) {
              return (
                <code className={cn("font-mono text-xs", className)}>
                  {children}
                </code>
              );
            }

            return (
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.9em] text-primary dark:bg-bg">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-md bg-gray-950 p-4 text-xs leading-6 text-gray-100">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-border">
              <table className="w-full border-collapse text-left text-xs">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-gray-200 bg-gray-50 px-3 py-2 font-semibold text-gray-900 dark:border-border dark:bg-surface dark:text-text">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-gray-100 px-3 py-2 dark:border-border">
              {children}
            </td>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </article>
  );
}
