"use client";

import { LucideIcon } from "lucide-react";

interface ComingSoonPanelProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
}

/** Shared shell for the deliberately unbuilt builder tabs. */
export default function ComingSoonPanel({
  icon: Icon,
  title,
  description,
  features,
}: ComingSoonPanelProps) {
  return (
    <div className="flex flex-1 items-center justify-center bg-panel p-12">
      <div className="w-full max-w-lg space-y-5 rounded-2xl border border-hair bg-surface p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-panel text-ink">
          <Icon className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-ink">{title}</h2>
          <p className="text-sm leading-relaxed text-muted">{description}</p>
        </div>

        <ul className="space-y-2 text-left">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-center justify-between rounded-lg border border-hair bg-panel px-3 py-2.5 text-xs text-muted"
            >
              <span>{feature}</span>
              <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink">
                Coming Soon
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
