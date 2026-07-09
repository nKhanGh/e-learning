"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type ToggleRowProps = {
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export const ToggleRow = ({
  label,
  hint,
  checked,
  onCheckedChange,
}: ToggleRowProps) => (
  <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 p-3 dark:border-border">
    <div>
      <Label>{label}</Label>
      <p className="mt-1 text-xs text-gray-500 dark:text-muted">{hint}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);
