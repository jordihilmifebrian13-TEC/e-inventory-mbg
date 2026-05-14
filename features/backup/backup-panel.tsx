"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BackupPanel() {
  const [busy, setBusy] = React.useState(false);

  async function download() {
    setBusy(true);
    try {
      const res = await fetch("/api/backup/export");
      if (!res.ok) throw new Error("Gagal membuat cadangan");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mbg-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Unduhan cadangan dimulai");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setBusy(false);
    }
  }

  async function recordManual() {
    setBusy(true);
    try {
      const res = await fetch("/api/backup/export", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Gagal");
      toast.success("Backup manual dicatat");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup & restore</CardTitle>
        <p className="text-sm text-muted-foreground">
          Produksi disarankan memakai <code className="font-mono">pg_dump</code>{" "}
          terjadwal. Endpoint ini menyediakan snapshot JSON untuk kebutuhan audit
          cepat.
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button className="rounded-xl" disabled={busy} onClick={() => void download()}>
          Unduh snapshot JSON
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          disabled={busy}
          onClick={() => void recordManual()}
        >
          Catat backup manual
        </Button>
      </CardContent>
    </Card>
  );
}
