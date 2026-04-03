"use client";

import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown } from "lucide-react";
import { LANGUAGE_LIST } from "@/lib/languages";
import { useLanguage } from "@/lib/context/language-context";

export function LanguageSwitcher() {
  const { language: activeLanguage, setLanguage: setActiveLanguage } = useLanguage();

  const current = LANGUAGE_LIST.find((l) => l.code === activeLanguage)!;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-lg">
              {current.flag}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{current.label}</span>
              <span className="text-muted-foreground truncate text-xs">
                Active language
              </span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--base-sidebar-width] min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            {LANGUAGE_LIST.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setActiveLanguage(lang.code)}
                className="gap-2 p-2"
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
