"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDecimal } from "@/lib/utils";
import { freshnessFromReceivedAt, freshnessLabel } from "@/services/freshness";
import type { RoleSlug } from "@prisma/client";
import { useState } from "react";

type Row = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  minStock: number;
  onHand: number;
  indicator: "green" | "yellow" | "red";
  avgUnitCost: number;
  batches: {
    id: string;
    batchNo: string;
    remaining: number;
    receivedAt: string;
    unitCost: number;
  }[];
};

export function InventoryTable({ role }: { role: RoleSlug }) {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [q, setQ] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
 
  const [name, setName] = useState(""); 
  const [sku, setSku] = useState(""); 
  const [category, setCategory] = useState(""); 
  const [unit, setUnit] = useState(""); 
  const [minStock, setMinStock] = useState(""); 
  const [maxStock, setMaxStock] = useState("");

  const handleSubmit = async () => { 
    await fetch("/api/inventory/items", {
      method: "POST", 
      headers: { 
        "Content-Type": "application/json", 
      }, 
      
      body: JSON.stringify({ 
        name, 
        sku, 
        category, 
        unit, 
        minStock, 
        maxStock, }), 
      }); 
      alert("Bahan berhasil ditambahkan"); 
      location.reload(); 
    };

  React.useEffect(() => {
    (async () => {
      const res = await fetch("/api/inventory/items");
      const json = await res.json();
      setRows(json.items as Row[]);
    })();
  }, []);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        r.sku.toLowerCase().includes(s) ||
        r.category.toLowerCase().includes(s),
    );
  }, [rows, q]);

  const columns = React.useMemo<ColumnDef<Row>[]>(
    () => [
      { accessorKey: "name", header: "Bahan" },
      { accessorKey: "sku", header: "SKU" },
      { accessorKey: "category", header: "Kategori" },
      {
        accessorKey: "onHand",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Stok
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => formatDecimal(row.original.onHand, 2),
      },
      {
        id: "status",
        header: "Indikator",
        cell: ({ row }) => {
          const v = row.original.indicator;
          const variant =
            v === "green" ? "success" : v === "yellow" ? "warning" : "danger";
          const label = v === "green" ? "Aman" : v === "yellow" ? "Menipis" : "Habis";
          return <Badge variant={variant}>{label}</Badge>;
        },
      },
      {
        accessorKey: "avgUnitCost", 
        header: "HPP Rata-rata", 
        cell: ({ row }) => 
          new Intl.NumberFormat("id-ID", { 
            style: "currency", 
            currency: "IDR", 
            minimumFractionDigits: 0, 
          }).format(row.original.avgUnitCost),
        }, 
      ], 
      [], 
    );
  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">Status stok & FIFO</CardTitle>
          <p className="text-sm text-muted-foreground">
            Role Anda: {role.replaceAll("_", " ")} — data publik hanya transaksi
            terverifikasi.
          </p>
        </div>
        <Input
          placeholder="Cari nama, SKU, kategori…"
          className="max-w-md"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </CardHeader>
      <CardContent className="space-y-4">
      <div className="grid gap-2 md:grid-cols-2"> 
      <Input 
      placeholder="Nama bahan" 
      value={name} 
      onChange={(e) => setName(e.target.value)} 
      /> 
      
      <Input placeholder="SKU" 
      value={sku} 
      onChange={(e) => setSku(e.target.value)} 
      /> 
      
      <Input placeholder="Kategori" 
      value={category} 
      onChange={(e) => setCategory(e.target.value)} 
      /> 
      
      <Input placeholder="Satuan" 
      value={unit} 
      onChange={(e) => setUnit(e.target.value)} 
      /> 
      
      <Input placeholder="Minimum stok" 
      value={minStock} 
      onChange={(e) => setMinStock(e.target.value)} 
      /> 
      
      <Input placeholder="Maximum stok" 
      value={maxStock} 
      onChange={(e) => setMaxStock(e.target.value)} 
      /> 
      </div> 
      <Button onClick={handleSubmit}> 
      Tambah Bahan 
      </Button>

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
            {table.getPageCount() || 1}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Berikutnya
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/40 p-4 text-sm">
          <p className="font-medium">Detail batch (FIFO)</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {filtered.slice(0, 4).map((it) => (
              <div key={it.id} className="rounded-xl border bg-background p-3">
                <p className="font-semibold">{it.name}</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {it.batches.slice(0, 4).map((b) => {
                    const st = freshnessFromReceivedAt(new Date(b.receivedAt));
                    return (
                      <li key={b.id} className="flex justify-between gap-2">
                        <span>
                          {b.batchNo} · {freshnessLabel(st)}
                        </span>
                        <span className="font-mono text-foreground">
                          {formatDecimal(b.remaining, 2)} {it.unit}
                        </span>
                      </li>
                    );
                  })}
                  {it.batches.length === 0 && (
                    <li>Tidak ada batch aktif</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
