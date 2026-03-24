import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function ChatPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Conversation Practice</h1>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">
            AI conversation partner coming soon
          </p>
        </div>
      </main>
    </>
  );
}
