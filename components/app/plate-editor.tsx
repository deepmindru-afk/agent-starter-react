'use client';

import { useCallback, useState } from 'react';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Quote,
  Strikethrough,
  Underline,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  BasicMarksPlugin,
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  HeadingPlugin,
  HighlightPlugin,
  HorizontalRulePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import {
  Plate,
  ParagraphPlugin,
  usePlateEditor,
} from 'platejs/react';

import { Editor, EditorContainer } from '@/components/ui/editor';
import { cn } from '@/lib/shadcn/utils';

function ToolbarButton({
  active,
  children,
  onClick,
  tooltip,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={cn(
        'flex size-7 items-center justify-center rounded-md text-xs transition-colors',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
      )}
    >
      {children}
    </button>
  );
}

export function PlateEditor() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [key, setKey] = useState(0);

  const editor = usePlateEditor({
    plugins: [
      ParagraphPlugin,
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin,
      HighlightPlugin,
      HeadingPlugin.configure({ options: { levels: [1, 2, 3] } }),
      H1Plugin,
      H2Plugin,
      H3Plugin,
      BlockquotePlugin,
      HorizontalRulePlugin,
    ],
  });

  const handleReset = useCallback(() => {
    editor.tf.setValue([
      { children: [{ text: '' }], type: 'p' },
    ]);
    setKey((k) => k + 1);
  }, [editor.tf]);

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-lg border',
        isDark ? 'border-sidebar-border/30' : 'border-sidebar-border/40',
      )}
      data-color-scheme={isDark ? 'dark' : 'light'}
    >
      {/* Toolbar */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5',
          isDark ? 'border-sidebar-border/20 bg-sidebar-accent/15' : 'border-sidebar-border/20 bg-sidebar-accent/10',
        )}
      >
        <ToolbarButton onClick={() => editor.tf.toggle({ key: 'bold' })} tooltip="Bold">
          <Bold className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.tf.toggle({ key: 'italic' })} tooltip="Italic">
          <Italic className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.tf.toggle({ key: 'underline' })} tooltip="Underline">
          <Underline className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.tf.toggle({ key: 'strikethrough' })} tooltip="Strikethrough">
          <Strikethrough className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.tf.toggle({ key: 'code' })} tooltip="Code">
          <Code className="size-3.5" />
        </ToolbarButton>

        <span className="mx-1 h-4 w-px bg-sidebar-border/30" />

        <ToolbarButton onClick={() => editor.tf.toggle({ key: 'h1' })} tooltip="Heading 1">
          <Heading1 className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.tf.toggle({ key: 'h2' })} tooltip="Heading 2">
          <Heading2 className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.tf.toggle({ key: 'h3' })} tooltip="Heading 3">
          <Heading3 className="size-3.5" />
        </ToolbarButton>

        <span className="mx-1 h-4 w-px bg-sidebar-border/30" />

        <ToolbarButton onClick={() => editor.tf.toggle({ key: 'blockquote' })} tooltip="Blockquote">
          <Quote className="size-3.5" />
        </ToolbarButton>

        <div className="flex-1" />

        <ToolbarButton onClick={handleReset} tooltip="Reset">
          <span className="text-[10px] font-medium">↺</span>
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContainer
        className={cn(
          'flex-1 overflow-y-auto',
          isDark ? 'bg-sidebar/80' : 'bg-white/50',
        )}
      >
        <Editor
          key={key}
          placeholder="Start typing..."
          className={cn(
            'size-full px-3 py-3 text-sm',
            isDark ? 'text-sidebar-foreground' : 'text-gray-800',
          )}
        />
      </EditorContainer>
    </div>
  );
}
