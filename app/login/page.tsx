import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
          Memuat halaman masuk…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
