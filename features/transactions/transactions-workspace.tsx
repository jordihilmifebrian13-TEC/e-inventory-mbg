"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { formatISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOfflineDraft } from "@/hooks/use-offline-draft";

type Item = { id: string; name: string; unit: string };

const inboundSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  supplier: z.string().min(2),
  unitPrice: z.coerce.number().nonnegative(),
  performedAt: z.string().min(1),
});

const usageSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  notes: z.string().optional(),
  performedAt: z.string().min(1),
});

const wasteSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  reason: z.string().min(3),
  performedAt: z.string().min(1),
});

const returnSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  reason: z.string().min(3),
  performedAt: z.string().min(1),
});

export function TransactionsWorkspace({ items }: { items: Item[] }) {
  const offline = useOfflineDraft("transactions");

  const inbound = useForm<z.infer<typeof inboundSchema>>({
    resolver: zodResolver(inboundSchema),
    defaultValues: {
      itemId: "",
      quantity: 1,
      supplier: "",
      unitPrice: 0,
      performedAt: formatISO(new Date()).slice(0, 16),
    },
  });

  React.useEffect(() => {
    const d = offline.load();
    if (d?.inbound) inbound.reset(d.inbound as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function postJson(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan");
    return json;
  }

  return (
    <Tabs defaultValue="inbound" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 gap-2 rounded-xl bg-muted/60 p-1 sm:grid-cols-4">
        <TabsTrigger value="inbound">Barang masuk</TabsTrigger>
        <TabsTrigger value="usage">Pemakaian</TabsTrigger>
        <TabsTrigger value="return">Return</TabsTrigger>
        <TabsTrigger value="waste">Waste</TabsTrigger>
      </TabsList>

      <TabsContent value="inbound">
        <Card>
          <CardHeader>
            <CardTitle>Barang masuk</CardTitle>
            <p className="text-sm text-muted-foreground">
              Draft menunggu verifikasi Koordinator. Stok bertambah setelah
              disetujui.
            </p>
          </CardHeader>
          <CardContent>
            <Form {...inbound}>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={inbound.handleSubmit(async (v) => {
                  try {
                    await postJson("/api/transactions/inbound", {
                      ...v,
                      performedAt: new Date(v.performedAt).toISOString(),
                    });
                    toast.success("Draft barang masuk dikirim");
                    offline.save({ inbound: v });
                    inbound.reset({
                      ...inbound.getValues(),
                      quantity: 1,
                      supplier: "",
                      unitPrice: 0,
                    });
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Gagal");
                  }
                })}
              >
                <FormField
                  control={inbound.control}
                  name="itemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bahan</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih bahan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {items.map((it) => (
                            <SelectItem key={it.id} value={it.id}>
                              {it.name} ({it.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={inbound.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={inbound.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={inbound.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga satuan (IDR)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={inbound.control}
                  name="performedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal masuk</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" className="h-12 rounded-xl px-8">
                    Simpan draft
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="usage">
        <OutboundForm
          items={items}
          title="Pemakaian"
          endpoint="/api/transactions/usage"
          schema={usageSchema}
          noteField="notes"
          noteLabel="Keterangan (opsional)"
        />
      </TabsContent>

      <TabsContent value="return">
        <OutboundForm
          items={items}
          title="Return"
          endpoint="/api/transactions/return"
          schema={returnSchema}
          noteField="reason"
          noteLabel="Alasan return"
        />
      </TabsContent>

      <TabsContent value="waste">
        <OutboundForm
          items={items}
          title="Waste"
          endpoint="/api/transactions/waste"
          schema={wasteSchema}
          noteField="reason"
          noteLabel="Alasan waste"
        />
      </TabsContent>
    </Tabs>
  );
}

function OutboundForm({
  items,
  title,
  endpoint,
  schema,
  noteField,
  noteLabel,
}: {
  items: Item[];
  title: string;
  endpoint: string;
  schema: z.ZodTypeAny;
  noteField: "notes" | "reason";
  noteLabel: string;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      itemId: "",
      quantity: 1,
      performedAt: formatISO(new Date()).slice(0, 16),
      notes: "",
      reason: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Transaksi dicatat sebagai draft hingga diverifikasi.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={form.handleSubmit(async (raw) => {
              try {
                const v = schema.parse(raw);
                const body = {
                  itemId: v.itemId,
                  quantity: v.quantity,
                  performedAt: new Date(v.performedAt).toISOString(),
                  ...(noteField === "notes"
                    ? { notes: (v as { notes?: string }).notes }
                    : { reason: (v as { reason: string }).reason }),
                };
                const res = await fetch(endpoint, {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify(body),
                });
                const json = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan");
                toast.success("Draft transaksi dikirim");
                form.reset({
                  itemId: "",
                  quantity: 1,
                  performedAt: formatISO(new Date()).slice(0, 16),
                  notes: "",
                  reason: "",
                });
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Gagal");
              }
            })}
          >
            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bahan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih bahan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((it) => (
                        <SelectItem key={it.id} value={it.id}>
                          {it.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {noteField === "notes" ? (
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{noteLabel}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{noteLabel}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="performedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="h-12 rounded-xl px-8">
                Simpan draft
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
