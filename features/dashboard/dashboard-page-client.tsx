"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Boxes, Trash2, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrencyIdr, formatDecimal } from "@/lib/utils";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { RoleSlug } from "@prisma/client";

type Stats = {
  totalStock: number;
  lowStock: number;
  totalWasteQty: number;
  totalWasteLoss: number;
  transactionsToday: number;
  weekUsage: { date: string; qty: number }[];
};

export function DashboardPageClient({ role }: { role: RoleSlug }) {
  const online = useOnlineStatus();
  const [data, setData] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) throw new Error("fetch");
        const json = (await res.json()) as Stats;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData =
    data?.weekUsage?.map((d) => ({
      name: d.date.slice(5),
      qty: d.qty,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="rounded-full">
          Role: {role.replaceAll("_", " ")}
        </Badge>
        <Badge
          variant={online ? "success" : "warning"}
          className="rounded-full"
        >
          {online ? "Realtime aktif" : "Mode offline — draf lokal"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total stok (qty)"
          icon={<Boxes className="h-4 w-4" />}
          value={loading ? null : formatDecimal(data?.totalStock ?? 0, 0)}
        />
        <StatCard
          title="Stok menipis"
          icon={<Activity className="h-4 w-4" />}
          value={loading ? null : String(data?.lowStock ?? 0)}
          tone="warning"
        />
        <StatCard
          title="Total waste (qty)"
          icon={<Trash2 className="h-4 w-4" />}
          value={loading ? null : formatDecimal(data?.totalWasteQty ?? 0, 0)}
        />
        <StatCard
          title="Transaksi hari ini"
          icon={<Truck className="h-4 w-4" />}
          value={loading ? null : String(data?.transactionsToday ?? 0)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pemakaian 7 hari</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fillQty" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(160 84% 39%)"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(160 84% 39%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="qty"
                    stroke="hsl(160 84% 39%)"
                    fill="url(#fillQty)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ringkasan kerugian waste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <>
                <p className="text-muted-foreground">
                  Estimasi nilai kerugian (FIFO + PPN 11% tercatat pada waste log).
                </p>
                <p className="text-2xl font-semibold tracking-tight">
                  {formatCurrencyIdr(data?.totalWasteLoss ?? 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  icon,
  value,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  value: string | null;
  tone?: "warning";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card
        className={
          tone === "warning"
            ? "border-amber-200/80 dark:border-amber-900/50"
            : undefined
        }
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="rounded-lg bg-muted p-2 text-muted-foreground">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          {value === null ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-3xl font-semibold tracking-tight">{value}</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
