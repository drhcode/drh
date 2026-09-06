'use client';

import * as React from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Table as TableIcon,
  Undo2,
} from 'lucide-react';
import type { MediaRow } from '@/types/database';
import { MediaLibraryDialog } from '@/components/admin/media/media-picker';
import { cn } from '@/lib/utils';

/**
 * Article editor (spec §58).
 *
 * Supports headings, lists, quotes, images, tables, code blocks and links.
 * Output is HTML, stored in `blog_translations.content_html` and rendered on
 * the public site through the fixed `.prose-drh` stylesheet — the editor cannot
 * introduce arbitrary inline styles or scripts.
 */
export function RichEditor({
  name,
  defaultValue = '',
  placeholder = 'Write the article…',
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [html, setHtml] = React.useState(defaultValue);
  const [mediaOpen, setMediaOpen] = React.useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: { HTMLAttributes: { class: 'code-block' } },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https', 'mailto'],
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      ImageExtension.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: 'prose-drh min-h-96 max-w-none px-5 py-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor: instance }) => setHtml(instance.getHTML()),
  });

  function insertImage(media: MediaRow) {
    editor?.chain().focus().setImage({ src: media.url, alt: media.alt_en ?? '' }).run();
    setMediaOpen(false);
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previous ?? 'https://');

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <input type="hidden" name={name} value={html} />

      {editor && (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-sunken px-2 py-1.5">
          <ToolbarButton
            editor={editor}
            label="Bold"
            active="bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            editor={editor}
            label="Italic"
            active="italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            editor={editor}
            label="Heading 2"
            active="heading"
            activeAttrs={{ level: 2 }}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            editor={editor}
            label="Heading 3"
            active="heading"
            activeAttrs={{ level: 3 }}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="size-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            editor={editor}
            label="Bullet list"
            active="bulletList"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            editor={editor}
            label="Numbered list"
            active="orderedList"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            editor={editor}
            label="Quote"
            active="blockquote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            editor={editor}
            label="Code block"
            active="codeBlock"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code className="size-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton editor={editor} label="Link" active="link" onClick={setLink}>
            <Link2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            editor={editor}
            label="Remove link"
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <Link2Off className="size-4" />
          </ToolbarButton>
          <ToolbarButton editor={editor} label="Insert image" onClick={() => setMediaOpen(true)}>
            <ImagePlus className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            editor={editor}
            label="Insert table"
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          >
            <TableIcon className="size-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            editor={editor}
            label="Undo"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            editor={editor}
            label="Redo"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="size-4" />
          </ToolbarButton>
        </div>
      )}

      <EditorContent editor={editor} />

      <MediaLibraryDialog open={mediaOpen} onOpenChange={setMediaOpen} onSelect={insertImage} />
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />;
}

function ToolbarButton({
  editor,
  label,
  active,
  activeAttrs,
  onClick,
  children,
}: {
  editor: Editor;
  label: string;
  active?: string;
  activeAttrs?: Record<string, unknown>;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const isActive = active ? editor.isActive(active, activeAttrs) : false;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={isActive}
      className={cn(
        'rounded-md p-1.5 transition-colors',
        isActive
          ? 'bg-accent-subtle text-accent'
          : 'text-muted-foreground hover:bg-surface hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
