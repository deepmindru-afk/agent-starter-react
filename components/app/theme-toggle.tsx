'use client';

import { useTheme } from 'next-themes';
import { MonitorIcon, MoonIcon, SunIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shadcn/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        'text-foreground bg-background flex w-full flex-row justify-end divide-x overflow-hidden rounded-full border',
        className
      )}
    >
      <span className="sr-only">Color scheme toggle</span>
      <Button type="button" variant="ghost" size="icon" onClick={() => setTheme('dark')} className="rounded-none p-1 pl-1.5">
        <span className="sr-only">Enable dark color scheme</span>
        <MoonIcon
          suppressHydrationWarning
          size={16}
          weight="bold"
          className={cn(theme !== 'dark' && 'opacity-25')}
        />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setTheme('light')}
        className="rounded-none px-1.5 py-1"
      >
        <span className="sr-only">Enable light color scheme</span>
        <SunIcon
          suppressHydrationWarning
          size={16}
          weight="bold"
          className={cn(theme !== 'light' && 'opacity-25')}
        />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setTheme('system')}
        className="rounded-none p-1 pr-1.5"
      >
        <span className="sr-only">Enable system color scheme</span>
        <MonitorIcon
          suppressHydrationWarning
          size={16}
          weight="bold"
          className={cn(theme !== 'system' && 'opacity-25')}
        />
      </Button>
    </div>
  );
}
