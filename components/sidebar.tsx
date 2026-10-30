"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { FilterGroup } from "@/lib/recipes";

type Props = { groups: FilterGroup[]; total: number; active: string | null };

export function SidebarWithParams(props: Omit<Props, "active">) {
  const params = useSearchParams();
  const onHome = usePathname() === "/";
  return <Sidebar {...props} active={onHome ? (params.get("tag") ?? "") : null} />;
}

export function Sidebar({ groups, total, active }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/90 px-5 py-3 backdrop-blur lg:hidden print:hidden">
        <Brand onClick={close} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="sidebar"
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium"
        >
          {open ? "Loka" : "Valmynd"}
        </button>
      </header>

      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={close} aria-hidden />}

      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 overflow-y-auto border-r border-line bg-paper px-5 py-8 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 print:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden px-3 lg:block">
          <Brand />
        </div>

        <nav className="mt-2 space-y-7 lg:mt-10" aria-label="Flokkar og merki">
          <NavItem href="/" label="Allar uppskriftir" count={total} active={active === ""} onClick={close} />
          {groups.map((g) => (
            <section key={g.title}>
              <h2 className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted uppercase">{g.title}</h2>
              <ul className="space-y-0.5">
                {g.items.map((i) => (
                  <li key={i.slug}>
                    <NavItem
                      href={`/?tag=${i.slug}`}
                      label={i.label}
                      count={i.count}
                      active={active === i.slug}
                      onClick={close}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </aside>
    </>
  );
}

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="font-serif text-2xl font-semibold tracking-tight">
      Matur<span className="text-accent">.</span>
    </Link>
  );
}

function NavItem(props: { href: string; label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <Link
      href={props.href}
      onClick={props.onClick}
      aria-current={props.active ? "page" : undefined}
      className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-[15px] transition-colors ${
        props.active ? "bg-accent-soft font-medium text-accent" : "text-ink/80 hover:bg-line/60 hover:text-ink"
      }`}
    >
      {props.label}
      <span className={`text-xs tabular-nums ${props.active ? "text-accent" : "text-muted"}`}>{props.count}</span>
    </Link>
  );
}
