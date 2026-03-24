"use client";

import { Button } from "@/components/ui/button";
import {
  UtensilsIcon,
  PlaneIcon,
  SunIcon,
  BriefcaseIcon,
  CpuIcon,
  TreesIcon,
  LandmarkIcon,
  ShuffleIcon,
} from "lucide-react";

const topics = [
  { id: "daily-life", label: "Daily Life", icon: SunIcon },
  { id: "travel", label: "Travel", icon: PlaneIcon },
  { id: "food-cooking", label: "Food & Cooking", icon: UtensilsIcon },
  { id: "culture", label: "Culture", icon: LandmarkIcon },
  { id: "technology", label: "Technology", icon: CpuIcon },
  { id: "nature", label: "Nature", icon: TreesIcon },
  { id: "work", label: "Work", icon: BriefcaseIcon },
] as const;

interface TopicSelectorProps {
  onSelect: (topic: string) => void;
}

export function TopicSelector({ onSelect }: TopicSelectorProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h2 className="mb-2 text-xl font-semibold">Choose a Topic</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Select a topic for your reading passage
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {topics.map((topic) => (
          <Button
            key={topic.id}
            variant="outline"
            size="lg"
            className="flex h-auto flex-col gap-2 py-4"
            onClick={() => onSelect(topic.label)}
          >
            <topic.icon className="size-5" />
            <span className="text-xs">{topic.label}</span>
          </Button>
        ))}
        <Button
          variant="outline"
          size="lg"
          className="flex h-auto flex-col gap-2 border-dashed py-4"
          onClick={() => {
            const random = topics[Math.floor(Math.random() * topics.length)];
            onSelect(random.label);
          }}
        >
          <ShuffleIcon className="size-5" />
          <span className="text-xs">Surprise Me</span>
        </Button>
      </div>
    </div>
  );
}
