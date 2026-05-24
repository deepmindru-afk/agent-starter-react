'use client';

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Model {
  id: string;
  name: string;
}

interface TopBarProps {
  onSidebarOpen: () => void;
}

export function TopBar({ onSidebarOpen }: TopBarProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    fetch('/api/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => {
        const list: Model[] = data.models ?? [];
        setModels(list);
        if (list.length > 0) setSelectedModel(list[0].id);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-30 flex h-12 items-center justify-between border-b bg-background/80 px-3 backdrop-blur-sm md:h-14 md:px-6">
      <button
        onClick={onSidebarOpen}
        className="rounded-md p-2 transition-colors hover:bg-accent"
        aria-label="Open chat history"
      >
        <Menu className="size-5" />
      </button>

      {models.length > 0 && (
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-40 text-base md:w-48">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
