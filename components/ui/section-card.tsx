import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-border-subtle bg-surface p-6 shadow-sm shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-8">
      <h2 className="text-foreground text-2xl font-semibold leading-tight">{title}</h2>
      {description ? <p className="text-text-muted mt-2 text-base leading-relaxed">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
