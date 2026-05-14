import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan sistem</CardTitle>
        <p className="text-sm text-muted-foreground">
          Nilai konfigurasi disimpan pada tabel <code className="font-mono">SystemConfig</code>{" "}
          dan variabel lingkungan Vercel.
        </p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          Variabel penting: <code className="font-mono">DATABASE_URL</code>,{" "}
          <code className="font-mono">AUTH_SECRET</code>,{" "}
          <code className="font-mono">NEXTAUTH_URL</code>, Turnstile, dan{" "}
          <code className="font-mono">NEXT_PUBLIC_APP_URL</code>.
        </p>
        <p>
          Untuk restore database penuh, gunakan cadangan <code className="font-mono">pg_restore</code>{" "}
          sesuai panduan deployment.
        </p>
      </CardContent>
    </Card>
  );
}
