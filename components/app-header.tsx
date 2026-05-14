"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { LogOut, Moon, Sun, Wifi, WifiOff } from "lucide-react";
import { MbgLogo } from "@/components/mbg-logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CommandMenu } from "@/components/command-menu";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { cn } from "@/lib/utils";
import type { RoleSlug } from "@prisma/client";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  role: RoleSlug;
};

export function AppHeader({ title, subtitle, role }: AppHeaderProps) {
  const online = useOnlineStatus();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="hidden items-center gap-3 md:flex">
        <MbgLogo size={40} priority />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col md:hidden">
        <h1 className="truncate text-base font-semibold">{title}</h1>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <CommandMenu role={role} />

        <div
          className={cn(
            "hidden items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium sm:flex",
            online
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
              : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
          )}
        >
          {online ? (
            <Wifi className="h-3.5 w-3.5" />
          ) : (
            <WifiOff className="h-3.5 w-3.5" />
          )}
          {online ? "Online" : "Offline"}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="rounded-xl"
          type="button"
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
          aria-label="Toggle tema"
          disabled={!mounted}
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 rounded-full px-2"
              type="button"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary">
                  MB
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel>Akun</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
