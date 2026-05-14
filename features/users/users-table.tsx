"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type U = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
};

export function UsersTable() {
  const [rows, setRows] = React.useState<U[]>([]);

  React.useEffect(() => {
    (async () => {
      const res = await fetch("/api/users");
      const json = await res.json();
      setRows(json.users as U[]);
    })();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengguna</CardTitle>
        <p className="text-sm text-muted-foreground">
          Reset password & buka blokir dapat ditambahkan melalui tindakan admin
          (Prisma Studio / endpoint terpisah).
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell className="font-mono text-sm">{u.username}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{u.role}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs">
                    <Badge variant={u.isActive ? "success" : "destructive"}>
                      {u.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                    {u.lockedUntil && (
                      <span className="text-amber-700 dark:text-amber-300">
                        Terkunci s/d {new Date(u.lockedUntil).toLocaleString("id-ID")}
                      </span>
                    )}
                    {u.failedLoginAttempts > 0 && (
                      <span>Gagal login: {u.failedLoginAttempts}</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
