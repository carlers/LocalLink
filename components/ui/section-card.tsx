import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-panel border-border-subtle bg-surface border p-4 sm:p-5">
      <h2 className="text-foreground text-lg font-semibold leading-tight">{title}</h2>
      {description ? <p className="text-text-muted mt-1 text-sm">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
