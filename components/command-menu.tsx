"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { mainNav } from "@/lib/navigation";
import type { RoleSlug } from "@prisma/client";

export function CommandMenu({ role }: { role: RoleSlug }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (e.key === "/" && e.target instanceof HTMLInputElement) return;
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const items = mainNav.filter((i) => i.roles.includes(role));
  const filtered = items.filter((i) =>
    i.title.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 max-w-[220px] flex-1 items-center gap-2 rounded-xl border bg-muted/40 px-3 text-left text-sm text-muted-foreground shadow-soft hover:bg-muted/70 sm:flex-none"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Cari menu…</span>
        <kbd className="ml-auto hidden rounded bg-background px-1.5 py-0.5 text-[10px] font-mono sm:inline">
          Ctrl K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
          <DialogTitle className="sr-only">Palet perintah</DialogTitle>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ketik untuk mencari…"
              className="h-12 border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {filtered.map((item) => (
              <button
                key={item.href}
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-muted"
                onClick={() => {
                  router.push(item.href);
                  setOpen(false);
                  setQ("");
                }}
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.title}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">Tidak ada hasil</p>
            )}
          </div>
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            Pintasan: Dashboard, Stok, Laporan, Hotline 127
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
