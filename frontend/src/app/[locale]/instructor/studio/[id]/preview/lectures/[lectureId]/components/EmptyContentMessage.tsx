export function EmptyContentMessage({ message }: { message: string }) {
  return (
    <div className="mt-3 rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-border dark:text-muted">
      {message}
    </div>
  );
}
