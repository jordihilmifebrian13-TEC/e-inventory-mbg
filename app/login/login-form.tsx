"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Turnstile } from "@marsidev/react-turnstile";
import { MbgLogo } from "@/components/mbg-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const schema = z.object({
  login: z.string().min(1, "Email atau username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const reason = params.get("reason");

  const [showPw, setShowPw] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { login: "", password: "", remember: false },
    mode: "onChange",
  });

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("mbg_saved_login");
      if (saved) form.setValue("login", saved);
    } catch {
      /* ignore */
    }
  }, [form]);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const devSkipTurnstile =
    process.env.NODE_ENV === "development" && !siteKey;

  async function onSubmit(values: FormValues) {
    setError(null);
    if (!devSkipTurnstile && !token) {
      setError("Silakan centang verifikasi “Saya bukan robot”.");
      return;
    }
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        login: values.login,
        password: values.password,
        turnstileToken: devSkipTurnstile ? "dev-no-keys" : (token ?? ""),
        callbackUrl,
      });
      if (res?.error) {
        setError("Login gagal. Periksa kredensial atau verifikasi robot.");
        setToken(null);
        return;
      }
      if (values.remember) {
        try {
          localStorage.setItem("mbg_saved_login", values.login);
        } catch {
          /* ignore */
        }
      } else {
        try {
          localStorage.removeItem("mbg_saved_login");
        } catch {
          /* ignore */
        }
      }
      const safe =
        callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
          ? callbackUrl
          : "/dashboard";
      router.push(safe);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-emerald-50/80 via-background to-background p-4 dark:from-emerald-950/30">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <MbgLogo size={72} priority className="drop-shadow-soft-lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{APP_NAME}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Masuk untuk mengelola inventori MBG di lingkungan SPPG.
            </p>
          </div>
        </div>

        <Card className="border-emerald-100/80 shadow-soft-lg dark:border-emerald-900/40">
          <CardHeader>
            <CardTitle className="text-xl">Masuk</CardTitle>
            <CardDescription>
              Gunakan akun yang diberikan administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reason === "idle" && (
              <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                Sesi berakhir karena tidak ada aktivitas. Silakan masuk kembali.
              </p>
            )}
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="login">Email atau Username</Label>
                <Input
                  id="login"
                  autoComplete="username"
                  placeholder="contoh: gudang"
                  {...form.register("login")}
                />
                {form.formState.errors.login && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.login.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={showPw}
                    onCheckedChange={(v) => setShowPw(Boolean(v))}
                  />
                  Tampilkan password
                </label>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={!!form.watch("remember")}
                    onCheckedChange={(v) => form.setValue("remember", Boolean(v))}
                  />
                  Simpan username
                </label>
              </div>

              {siteKey ? (
                <div className="flex justify-center py-1">
                  <Turnstile
                    siteKey={siteKey}
                    onSuccess={setToken}
                    onExpire={() => setToken(null)}
                  />
                </div>
              ) : (
                <p className="rounded-xl border border-dashed px-3 py-2 text-center text-xs text-muted-foreground">
                  Mode pengembangan tanpa Turnstile: verifikasi dilewati otomatis
                  jika tidak ada kunci Cloudflare.
                </p>
              )}

              {error && (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className={cn("h-12 w-full rounded-xl text-base")}
                disabled={loading}
              >
                {loading ? "Memproses…" : "Masuk"}
              </Button>

              <div className="text-center text-sm">
                <Link
                  href="/login#bantuan"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <p id="bantuan" className="mt-6 text-center text-xs text-muted-foreground">
          Bantuan reset akun: hubungi Super Admin atau{" "}
          <span className="font-semibold text-foreground">Hotline 127</span>.
        </p>
      </motion.div>
    </div>
  );
}
