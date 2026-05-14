"use client";

import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDecimal } from "@/lib/utils";

type Tx = {
  id: string;
  type: string;
  quantity: unknown;
  performedAt: string;
  notes: string | null;
  item: { name: string; unit: string };
  createdBy: { name: string; email: string };
};

export function VerificationPanel() {
  const [rows, setRows] = React.useState<Tx[]>([]);
  const [rejectId, setRejectId] = React.useState<string | null>(null);
  const [note, setNote] = React.useState("");

  async function refresh() {
    const res = await fetch("/api/transactions/pending");
    const json = await res.json();
    setRows(json.transactions as Tx[]);
  }

  React.useEffect(() => {
    void refresh();
  }, []);

  async function approve(id: string) {
    try {
      const res = await fetch(`/api/transactions/${id}/approve`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ note: null }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Gagal");
      }
      toast.success("Disetujui");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    }
  }

  async function reject() {
    if (!rejectId) return;
    try {
      const res = await fetch(`/api/transactions/${rejectId}/reject`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Gagal");
      }
      toast.success("Ditolak — dikembalikan ke petugas gudang");
      setRejectId(null);
      setNote("");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Antrean verifikasi</CardTitle>
          <p className="text-sm text-muted-foreground">
            Approve untuk mempublikasikan data dan mengunci perubahan. Reject
            mengembalikan ke petugas dengan catatan revisi.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">Tidak ada antrean.</p>
          )}
          {rows.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-3 rounded-xl border bg-background p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{t.type}</Badge>
                  <span className="font-semibold">{t.item.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDecimal(t.quantity, 2)} {t.item.unit} ·{" "}
                  {new Date(t.performedAt).toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Oleh {t.createdBy.name} ({t.createdBy.email})
                </p>
                {t.notes && (
                  <p className="text-sm">
                    <span className="font-medium">Catatan: </span>
                    {t.notes}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button className="rounded-xl" onClick={() => void approve(t.id)}>
                  Setujui
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setRejectId(t.id);
                    setNote("");
                  }}
                >
                  Tolak
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Catatan revisi</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="note">Wajib diisi (min. 3 karakter)</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: jumlah tidak sesuai bukti timbang"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Batal
            </Button>
            <Button onClick={() => void reject()}>Kirim penolakan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
