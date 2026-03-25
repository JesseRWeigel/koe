"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getCognates,
  getFalseFriends,
  searchCognates,
  type CognateEntry,
} from "@/lib/languages/cognates";
import { AlertTriangleIcon, BookOpenIcon, SearchIcon } from "lucide-react";

function CognateCard({ entry }: { entry: CognateEntry }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>{entry.spanish}</span>
            <span className="text-muted-foreground">↔</span>
            <span>{entry.portuguese}</span>
          </span>
          {entry.isFalseFriend ? (
            <Badge variant="destructive">
              <AlertTriangleIcon className="mr-1" />
              False Friend
            </Badge>
          ) : (
            <Badge variant="secondary">
              <BookOpenIcon className="mr-1" />
              True Cognate
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{entry.meaning}</p>
        {entry.note && (
          <p className="mt-2 text-sm font-medium text-destructive">
            {entry.note}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function CognateList({ entries }: { entries: CognateEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No cognates found.
      </p>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map((entry, i) => (
        <CognateCard key={`${entry.spanish}-${entry.portuguese}-${i}`} entry={entry} />
      ))}
    </div>
  );
}

export function CognateBrowser() {
  const [search, setSearch] = useState("");

  const allCognates = search ? searchCognates(search) : getCognates();
  const falseFriends = search
    ? searchCognates(search).filter((e) => e.isFalseFriend)
    : getFalseFriends();

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
        <input
          data-testid="cognate-search"
          placeholder="Search cognates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 pl-8 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
          )}
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All Cognates ({allCognates.length})
          </TabsTrigger>
          <TabsTrigger value="false-friends">
            False Friends ({falseFriends.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <CognateList entries={allCognates} />
        </TabsContent>

        <TabsContent value="false-friends">
          <CognateList entries={falseFriends} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
