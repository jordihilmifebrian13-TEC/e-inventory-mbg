"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Log = {
  id: string;
  action: string;
  entity: string;
  createdAt: string;
  ip: string | null;
  user: { name: string; email: string } | null;
};

export function AuditTable() {
  const [rows, setRows] = React.useState<Log[]>([]);

  React.useEffect(() => {
    (async () => {
      const res = await fetch("/api/audit?take=100");
      const json = await res.json();
      setRows(json.logs as Log[]);
    })();
  }, []);

  function exportCsv() {
    const header = ["waktu", "aksi", "entitas", "user", "ip"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.createdAt,
          r.action,
          r.entity,
          r.user?.email ?? "",
          r.ip ?? "",
        ]
          .map((c) => `"${String(c).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV audit diunduh");
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Audit trail</CardTitle>
          <p className="text-sm text-muted-foreground">
            Login, transaksi, verifikasi, dan ekspor tercatat di sini.
          </p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={exportCsv}>
          Ekspor CSV
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Entitas</TableHead>
              <TableHead>Pengguna</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{new Date(r.createdAt).toLocaleString("id-ID")}</TableCell>
                <TableCell>{r.action}</TableCell>
                <TableCell>{r.entity}</TableCell>
                <TableCell>{r.user?.name ?? "-"}</TableCell>
                <TableCell className="font-mono text-xs">{r.ip ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
