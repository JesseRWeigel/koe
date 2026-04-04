"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/lib/context/language-context";
import type { LanguageCode } from "@/lib/languages";
import {
  LayoutDashboardIcon,
  RepeatIcon,
  MessageCircleIcon,
  BookOpenIcon,
  LibraryIcon,
  GraduationCapIcon,
  PenLineIcon,
  AudioLinesIcon,
  BookTextIcon,
  BookMarkedIcon,
  ActivityIcon,
  WrenchIcon,
  SettingsIcon,
} from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType;
  languages?: LanguageCode[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Review",
    url: "/review",
    icon: RepeatIcon,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: MessageCircleIcon,
  },
  {
    title: "Read",
    url: "/read",
    icon: BookOpenIcon,
  },
  {
    title: "Vocabulary",
    url: "/vocabulary",
    icon: LibraryIcon,
  },
  {
    title: "Grammar",
    url: "/grammar",
    icon: GraduationCapIcon,
  },
  {
    title: "Writing",
    url: "/writing",
    icon: PenLineIcon,
  },
  {
    title: "Shadowing",
    url: "/shadowing",
    icon: AudioLinesIcon,
  },
  {
    title: "Kanji",
    url: "/kanji",
    icon: BookTextIcon,
    languages: ["ja"],
  },
  {
    title: "Pitch",
    url: "/pitch",
    icon: ActivityIcon,
    languages: ["ja"],
  },
  {
    title: "Guides",
    url: "/guides",
    icon: BookMarkedIcon,
  },
  {
    title: "Tools",
    url: "/tools",
    icon: WrenchIcon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { language } = useLanguage();

  const visibleNavItems = navItems.filter(
    (item) => !item.languages || item.languages.includes(language),
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<a href="/dashboard" />}
            >
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-lg font-bold">
                声
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Koe</span>
                <span className="text-muted-foreground truncate text-xs">
                  Language Learning
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <LanguageSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Learn</SidebarGroupLabel>
          <SidebarMenu>
            {visibleNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<a href={item.url} />}
                  isActive={pathname.startsWith(item.url)}
                  tooltip={item.title}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<a href="/settings" />} tooltip="Settings">
              <SettingsIcon />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
