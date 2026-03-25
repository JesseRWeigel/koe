"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RepeatIcon,
  BookOpenIcon,
  MessageCircleIcon,
  LibraryIcon,
  PenLineIcon,
} from "lucide-react";
import { getDashboardStats } from "@/lib/dashboard";
import Link from "next/link";

export default function DashboardPage() {
  const stats = getDashboardStats();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </header>
      <main className="flex-1 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Today</CardTitle>
              <RepeatIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-bold">
                {stats.dueToday}
              </div>
              <p className="text-muted-foreground text-xs">cards to review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Words Learned
              </CardTitle>
              <LibraryIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-bold">
                {stats.wordsLearned}
              </div>
              <p className="text-muted-foreground text-xs">total vocabulary</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention</CardTitle>
              <BookOpenIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-bold">
                {stats.retention !== null ? `${stats.retention}%` : "—"}
              </div>
              <p className="text-muted-foreground text-xs">review accuracy</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversations
              </CardTitle>
              <MessageCircleIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-bold">
                {stats.conversations}
              </div>
              <p className="text-muted-foreground text-xs">practice sessions</p>
            </CardContent>
          </Card>
        </div>

        {stats.streakDays > 0 && (
          <div className="mt-4">
            <Card>
              <CardContent className="flex items-center gap-3 py-4">
                <span className="text-2xl">🔥</span>
                <div>
                  <div className="font-mono text-lg font-bold">
                    {stats.streakDays} day
                    {stats.streakDays !== 1 ? "s" : ""}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    study streak — keep it going!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/review">
            <Card className="flex h-full cursor-pointer flex-col items-center justify-center p-8 text-center transition-colors hover:bg-muted/50">
              <RepeatIcon className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">Review</h3>
              <p className="text-muted-foreground text-sm">
                {stats.dueToday > 0
                  ? `${stats.dueToday} cards due`
                  : "No cards due"}
              </p>
            </Card>
          </Link>
          <Link href="/chat">
            <Card className="flex h-full cursor-pointer flex-col items-center justify-center p-8 text-center transition-colors hover:bg-muted/50">
              <MessageCircleIcon className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">Conversation</h3>
              <p className="text-muted-foreground text-sm">
                Practice speaking with AI
              </p>
            </Card>
          </Link>
          <Link href="/read">
            <Card className="flex h-full cursor-pointer flex-col items-center justify-center p-8 text-center transition-colors hover:bg-muted/50">
              <BookOpenIcon className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">Read</h3>
              <p className="text-muted-foreground text-sm">
                Graded reading at your level
              </p>
            </Card>
          </Link>
          <Link href="/vocabulary">
            <Card className="flex h-full cursor-pointer flex-col items-center justify-center p-8 text-center transition-colors hover:bg-muted/50">
              <LibraryIcon className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">Vocabulary</h3>
              <p className="text-muted-foreground text-sm">
                {stats.wordsLearned > 0
                  ? `${stats.wordsLearned} words`
                  : "Add your first words"}
              </p>
            </Card>
          </Link>
        </div>
      </main>
    </>
  );
}
