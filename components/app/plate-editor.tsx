'use client';

import { useCallback } from 'react';
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
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';

import { Editor, EditorContainer, useEditor } from '@/components/ui/editor';
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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      UnderlineExtension,
      Highlight,
    ],
    editorProps: {
      attributes: {
        class: 'size-full px-3 py-3 text-sm outline-none',
      },
    },
  });

  const handleReset = useCallback(() => {
    editor?.commands.clearContent();
  }, [editor]);

  if (!editor) {
    return null;
  }

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
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          tooltip="Bold"
        >
          <Bold className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          tooltip="Italic"
        >
          <Italic className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          tooltip="Underline"
        >
          <Underline className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          tooltip="Strikethrough"
        >
          <Strikethrough className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
          tooltip="Code"
        >
          <Code className="size-3.5" />
        </ToolbarButton>

        <span className="mx-1 h-4 w-px bg-sidebar-border/30" />

        <ToolbarButton
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          tooltip="Heading 1"
        >
          <Heading1 className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          tooltip="Heading 2"
        >
          <Heading2 className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          tooltip="Heading 3"
        >
          <Heading3 className="size-3.5" />
        </ToolbarButton>

        <span className="mx-1 h-4 w-px bg-sidebar-border/30" />

        <ToolbarButton
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          tooltip="Blockquote"
        >
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
          editor={editor}
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
