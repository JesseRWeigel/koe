import {
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RepeatIcon, BookOpenIcon, MessageCircleIcon, LibraryIcon } from "lucide-react";

export default function DashboardPage() {
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
              <div className="text-2xl font-bold font-mono">0</div>
              <p className="text-muted-foreground text-xs">cards to review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Words Learned</CardTitle>
              <LibraryIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">0</div>
              <p className="text-muted-foreground text-xs">total vocabulary</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention</CardTitle>
              <BookOpenIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">—</div>
              <p className="text-muted-foreground text-xs">review accuracy</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <MessageCircleIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">0</div>
              <p className="text-muted-foreground text-xs">practice sessions</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <RepeatIcon className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Start Reviewing</h3>
            <p className="text-muted-foreground text-sm">
              Add vocabulary to begin your SRS reviews
            </p>
          </Card>
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <MessageCircleIcon className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Practice Conversation</h3>
            <p className="text-muted-foreground text-sm">
              Chat with AI in your target language
            </p>
          </Card>
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <BookOpenIcon className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Graded Reading</h3>
            <p className="text-muted-foreground text-sm">
              Read content matched to your level
            </p>
          </Card>
        </div>
      </main>
    </>
  );
}
