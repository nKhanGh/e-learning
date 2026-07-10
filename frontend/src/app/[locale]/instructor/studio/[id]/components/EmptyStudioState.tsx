import type { ReactNode } from "react";

type EmptyStudioStateProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
};

export const EmptyStudioState = ({
  icon,
  title,
  subtitle,
}: EmptyStudioStateProps) => (
  <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center dark:border-border">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
    <h3 className="mt-4 text-base font-bold text-gray-950 dark:text-text">
      {title}
    </h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-muted">
      {subtitle}
    </p>
  </div>
);
