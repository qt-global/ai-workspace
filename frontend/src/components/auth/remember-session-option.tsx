"use client";

import { useI18n } from "@/core/i18n/hooks";

interface RememberSessionOptionProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function RememberSessionOption({
  checked,
  onCheckedChange,
}: RememberSessionOptionProps) {
  const { t } = useI18n();

  return (
    <label className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-400 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.currentTarget.checked)}
        className="mt-1 size-4 rounded border-zinc-700 bg-zinc-900/80 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-zinc-950 accent-cyan-500"
      />
      <span>
        <span className="block font-medium text-zinc-200">
          {t.login.rememberMe}
        </span>
        <span className="text-zinc-400">{t.login.rememberMeDescription}</span>
      </span>
    </label>
  );
}
