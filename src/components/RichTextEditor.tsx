import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Link, Image, Heading1, Heading2 } from "lucide-react";
import { useCallback } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
}

const ToolbarBtn = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
  <button type="button" onClick={onClick} title={title}
    className={`p-1.5 rounded hover:bg-muted transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
  >
    {children}
  </button>
);

export default function RichTextEditor({ content, onChange, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, ImageExtension],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
  });

  const addLink = useCallback(() => {
    const url = window.prompt("URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("Image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return <div className="h-[300px] bg-muted animate-pulse rounded-xl" />;

  return (
    <div className={`border border-border rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all ${className || ""}`}>
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <Heading1 size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 size={15} />
        </ToolbarBtn>
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <List size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
          <ListOrdered size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
          <Quote size={15} />
        </ToolbarBtn>
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolbarBtn onClick={addLink} active={editor.isActive("link")} title="Add Link">
          <Link size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={addImage} title="Add Image">
          <Image size={15} />
        </ToolbarBtn>
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo size={15} />
        </ToolbarBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
