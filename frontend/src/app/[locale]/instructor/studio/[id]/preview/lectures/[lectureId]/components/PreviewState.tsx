import type { ReactNode } from "react";

type PreviewStateProps = {
  title: string;
  subtitle: string;
  action?: ReactNode;
};

export function PreviewState({ title, subtitle, action }: PreviewStateProps) {
  return (
    <div className="min-h-[70vh] bg-gray-50 px-2 py-4 dark:bg-bg">
      <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-surface">
        <h1 className="text-xl font-bold text-gray-900 dark:text-text">
          {title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-muted">{subtitle}</p>
        {action}
      </div>
    </div>
  );
}
