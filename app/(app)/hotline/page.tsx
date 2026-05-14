import Link from "next/link";
import { Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HOTLINE_LABEL, HOTLINE_NUMBER } from "@/lib/constants";

export default function HotlinePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-emerald-200/80 shadow-soft-lg dark:border-emerald-900/40">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Phone className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">{HOTLINE_LABEL}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Saluran resmi darurat Program Makan Bergizi Gratis.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Nomor singkat</p>
            <p className="text-6xl font-black tracking-tight text-primary">
              {HOTLINE_NUMBER}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Gunakan hotline ini untuk insiden keamanan pangan, gangguan distribusi,
            atau koordinasi darurat dengan pemerintah pusat/daerah sesuai SOP SPPG.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild className="h-12 rounded-xl">
              <Link href={`tel:${HOTLINE_NUMBER}`}>Hubungi sekarang</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-xl">
              <Link href="/dashboard">Kembali ke dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
