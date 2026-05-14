"use client";

import * as React from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export function ReportsClient() {
  const [items, setItems] = React.useState<unknown[]>([]);

  React.useEffect(() => {
    (async () => {
      const res = await fetch("/api/inventory/items");
      const json = await res.json();
      setItems(json.items ?? []);
    })();
  }, []);

  function exportExcel(sheetName: string) {
    const ws = XLSX.utils.json_to_sheet(items as object[]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `laporan-${sheetName.toLowerCase()}-${Date.now()}.xlsx`);
    toast.success("Berhasil mengekspor Excel");
  }

  function printPage() {
    window.print();
  }

  return (
    <Card className="print:shadow-none">
      <CardHeader>
        <CardTitle>Laporan</CardTitle>
        <p className="text-sm text-muted-foreground">
          Filter tanggal lanjutan dapat ditambahkan pada laporan terjadwal. Saat ini
          ekspor menggunakan snapshot stok terkini.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="stock">
          <TabsList className="flex flex-wrap rounded-xl">
            <TabsTrigger value="stock">Stok</TabsTrigger>
            <TabsTrigger value="hpp">HPP</TabsTrigger>
            <TabsTrigger value="waste">Waste</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>
          <TabsContent value="stock" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ekspor Excel ringkasan stok & batch.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-xl" onClick={() => exportExcel("Stok")}>
                Ekspor Excel
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={printPage}>
                Cetak / PDF (browser)
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="hpp" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              HPP dihitung otomatis dengan FIFO per batch.
            </p>
            <Button className="rounded-xl" onClick={() => exportExcel("HPP")}>
              Ekspor Excel
            </Button>
          </TabsContent>
          <TabsContent value="waste" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Laporan waste mengikuti log kerugian (FIFO + PPN 11%).
            </p>
            <Button className="rounded-xl" onClick={() => exportExcel("Waste")}>
              Ekspor Excel
            </Button>
          </TabsContent>
          <TabsContent value="audit" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Untuk detail audit lengkap, buka menu Audit Trail.
            </p>
            <Button variant="outline" className="rounded-xl" asChild>
              <a href="/audit">Buka audit trail</a>
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
