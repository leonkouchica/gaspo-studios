import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link,
  Image,
  ImagePlus,
  Heading1,
  Heading2,
  Code,
  Eye,
  Loader2,
} from "lucide-react";
import { useCallback, useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { arrayBufferToBase64 } from "../lib/base64";
import { uploadEditorImage } from "../lib/actions/upload";

export interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
  uploadFolder?: "newsletter" | "events" | "blog" | "campaigns" | "gallery" | "team";
  showHtmlToggle?: boolean;
  variables?: { label: string; value: string }[];
}

const ToolbarBtn = ({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
      active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
    }`}
  >
    {children}
  </button>
);

export default function RichTextEditor({
  content,
  onChange,
  className,
  placeholder,
  uploadFolder = "newsletter",
  showHtmlToggle = true,
  variables,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-xl my-3 shadow-sm border border-border",
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3 text-dark [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-3 [&_img]:shadow-sm",
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              const file = item.getAsFile();
              if (file) {
                event.preventDefault();
                uploadAndInsertImage(file);
                return true;
              }
            }
          }
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          const file = files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            uploadAndInsertImage(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Sync external content changes into TipTap when not actively typing in visual mode
  useEffect(() => {
    if (editor && !editor.isFocused && editor.getHTML() !== content) {
      editor.commands.setContent(content || "", false);
    }
  }, [content, editor]);

  // Upload handler converting to WebP via server sharp
  const uploadAndInsertImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (PNG, JPG, WebP, etc.).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image file size exceeds 10MB limit.");
        return;
      }

      setIsUploading(true);
      const toastId = toast.loading("Converting image to WebP & uploading...");
      try {
        const arrayBuffer = await file.arrayBuffer();
        const fileBase64 = arrayBufferToBase64(arrayBuffer);
        const result = await uploadEditorImage({
          data: {
            fileBase64,
            fileName: file.name,
            mimeType: file.type || "image/jpeg",
            folder: uploadFolder,
          },
        });

        const webpUrl = result.url;
        const cleanAlt = file.name.replace(/\.[^/.]+$/, "");

        if (mode === "visual" && editor) {
          editor
            .chain()
            .focus()
            .setImage({ src: webpUrl, alt: cleanAlt })
            .run();
        } else {
          // HTML Source mode
          const imgTag = `<img src="${webpUrl}" alt="${cleanAlt}" style="max-width:100%;height:auto;border-radius:8px;" />`;
          onChange(content ? `${content}\n${imgTag}` : imgTag);
        }

        toast.success("Image converted to WebP and inserted!", { id: toastId });
      } catch (err: any) {
        toast.error(`Image upload failed: ${err.message || "Unknown error"}`, { id: toastId });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [editor, mode, content, onChange, uploadFolder],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndInsertImage(file);
    }
  };

  const addLink = useCallback(() => {
    const url = window.prompt("Enter link URL (e.g. https://...):");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImageUrl = useCallback(() => {
    const url = window.prompt("Enter image URL (https://...):");
    if (url && url.trim()) {
      const cleanUrl = url.trim();
      if (mode === "visual" && editor) {
        editor.chain().focus().setImage({ src: cleanUrl }).run();
      } else {
        const imgTag = `<img src="${cleanUrl}" alt="Image" style="max-width:100%;height:auto;border-radius:8px;" />`;
        onChange(content ? `${content}\n${imgTag}` : imgTag);
      }
    }
  }, [editor, mode, content, onChange]);

  const insertVariable = (varValue: string) => {
    if (mode === "visual" && editor) {
      editor.chain().focus().insertContent(` ${varValue} `).run();
    } else {
      onChange(content ? `${content} ${varValue} ` : varValue);
    }
    toast.success(`Inserted ${varValue}`);
  };

  const handleModeChange = (newMode: "visual" | "html") => {
    if (newMode === "visual" && editor && editor.getHTML() !== content) {
      editor.commands.setContent(content || "", false);
    }
    setMode(newMode);
  };

  if (!editor) return <div className="h-[300px] bg-muted animate-pulse rounded-xl" />;

  return (
    <div
      className={`border border-border rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-white ${
        className || ""
      }`}
    >
      {/* Hidden computer file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Main Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 px-2.5 py-1.5 border-b border-border bg-muted/30">
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Text formatting (Visual mode) */}
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            disabled={mode === "html"}
            title="Bold"
          >
            <Bold size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            disabled={mode === "html"}
            title="Italic"
          >
            <Italic size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            disabled={mode === "html"}
            title="Heading 1"
          >
            <Heading1 size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            disabled={mode === "html"}
            title="Heading 2"
          >
            <Heading2 size={15} />
          </ToolbarBtn>

          <span className="w-px h-5 bg-border mx-1" />

          {/* Lists & Quotes */}
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            disabled={mode === "html"}
            title="Bullet List"
          >
            <List size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            disabled={mode === "html"}
            title="Numbered List"
          >
            <ListOrdered size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            disabled={mode === "html"}
            title="Quote"
          >
            <Quote size={15} />
          </ToolbarBtn>

          <span className="w-px h-5 bg-border mx-1" />

          {/* Links & Images */}
          <ToolbarBtn
            onClick={addLink}
            active={editor.isActive("link")}
            disabled={mode === "html"}
            title="Add Link"
          >
            <Link size={15} />
          </ToolbarBtn>

          {/* Upload Image from Computer (Auto-WebP) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Upload image from computer (Auto-converts to WebP)"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-xs font-semibold cursor-pointer disabled:opacity-50 ml-0.5"
          >
            {isUploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ImagePlus size={14} />
            )}
            <span>Upload Image</span>
            <span className="text-[9px] font-bold bg-primary/20 text-primary px-1 py-0.5 rounded uppercase tracking-wider">
              WebP
            </span>
          </button>

          {/* Insert image by URL */}
          <ToolbarBtn onClick={addImageUrl} title="Insert Image by URL">
            <Image size={15} />
          </ToolbarBtn>

          <span className="w-px h-5 bg-border mx-1" />

          {/* Undo / Redo */}
          <ToolbarBtn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={mode === "html"}
            title="Undo"
          >
            <Undo size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={mode === "html"}
            title="Redo"
          >
            <Redo size={15} />
          </ToolbarBtn>
        </div>

        {/* Right side: Visual vs HTML Code Toggle */}
        {showHtmlToggle && (
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => handleModeChange("visual")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                mode === "visual"
                  ? "bg-white text-dark shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-dark"
              }`}
              title="Visual WYSIWYG Editor"
            >
              <Eye size={13} />
              <span>Visual</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("html")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                mode === "html"
                  ? "bg-white text-dark shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-dark"
              }`}
              title="Raw HTML Source Code"
            >
              <Code size={13} />
              <span>HTML</span>
            </button>
          </div>
        )}
      </div>

      {/* Variable Pills (if provided) */}
      {variables && variables.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 bg-slate-50 border-b border-border text-xs text-muted-foreground">
          <span className="font-medium text-dark/70">Insert Variable:</span>
          {variables.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => insertVariable(v.value)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-border hover:border-primary hover:text-primary transition-colors text-xs font-mono font-medium shadow-2xs cursor-pointer"
              title={`Click to insert ${v.value}`}
            >
              <span className="text-primary font-bold">+</span>
              <span>{v.label || v.value}</span>
            </button>
          ))}
        </div>
      )}

      {/* Editor Body */}
      {mode === "visual" ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="relative">
          <div className="bg-slate-900 px-3.5 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>HTML Source Code (Editable)</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">
              &lt;/&gt;
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "<p>Write or paste your HTML here...</p>"}
            rows={12}
            className="w-full p-4 font-mono text-sm leading-relaxed bg-slate-950 text-slate-100 focus:outline-none resize-y min-h-[300px]"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
