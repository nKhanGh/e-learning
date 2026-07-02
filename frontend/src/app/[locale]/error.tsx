"use client";

import ErrorPageView from "@/components/errors/ErrorPageView";

const Error = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => (
  <ErrorPageView statusCode={500} onRetry={reset} />
);

export default Error;

