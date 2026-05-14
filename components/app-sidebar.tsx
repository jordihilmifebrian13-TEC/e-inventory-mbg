"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MbgLogo } from "@/components/mbg-logo";
import { mainNav } from "@/lib/navigation";
import type { RoleSlug } from "@prisma/client";

type AppSidebarProps = {
  role: RoleSlug;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

function NavLinks({
  role,
  collapsed,
  onNavigate,
}: {
  role: RoleSlug;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = mainNav.filter((i) => i.roles.includes(role));

  return (
    <nav className="flex flex-col gap-1 p-2">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
            title={collapsed ? item.title : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar({ role, collapsed, onToggleCollapsed }: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      <aside
        className={cn(
          "relative hidden border-r bg-card/80 backdrop-blur-md md:flex md:flex-col",
          collapsed ? "md:w-[76px]" : "md:w-64",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-3">
          <MbgLogo size={36} priority />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">
                E-Inventory MBG
              </p>
              <p className="truncate text-xs text-muted-foreground">SPPG</p>
            </div>
          )}
        </div>
        <ScrollArea className="flex-1">
          <NavLinks role={role} collapsed={collapsed} />
        </ScrollArea>
        <div className="border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2"
            onClick={onToggleCollapsed}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Ciutkan</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      <div className="flex h-14 items-center border-b px-3 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2 shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="flex h-16 items-center gap-2 border-b px-4">
              <MbgLogo size={36} />
              <div>
                <p className="text-sm font-semibold">E-Inventory MBG</p>
                <p className="text-xs text-muted-foreground">SPPG</p>
              </div>
            </div>
            <NavLinks
              role={role}
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <MbgLogo size={32} />
        <span className="ml-2 text-sm font-semibold">E-Inventory MBG</span>
      </div>

    </>
  );
}
