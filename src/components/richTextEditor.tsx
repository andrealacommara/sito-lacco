import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEffect, useCallback } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

type ToolbarButtonProps = {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ active, onClick, title, children }: ToolbarButtonProps) {
  return (
    <button
      title={title}
      type="button"
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? "bg-default-200 text-default-900"
          : "text-default-500 hover:bg-default-100 hover:text-default-800"
      }`}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, blockquote: false, codeBlock: false, code: false, horizontalRule: false }),
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "outline-none min-h-[100px] text-sm text-default-800 leading-relaxed",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  const handleAddLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("URL del link", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-0">
      <label className="text-sm font-medium mb-1.5">Testo email</label>
      <div className="rounded-xl border-2 border-default-200 hover:border-default-400 focus-within:border-default-foreground transition-colors">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-default-200">
          <ToolbarButton
            active={editor.isActive("bold")}
            title="Grassetto"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            title="Corsivo"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("underline")}
            title="Sottolineato"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <span style={{ textDecoration: "underline" }}>U</span>
          </ToolbarButton>
          <div className="w-px h-4 bg-default-200 mx-1" />
          <ToolbarButton
            active={editor.isActive("bulletList")}
            title="Elenco puntato"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            ≡
          </ToolbarButton>
          <div className="w-px h-4 bg-default-200 mx-1" />
          <ToolbarButton
            active={editor.isActive("link")}
            title="Inserisci link"
            onClick={handleAddLink}
          >
            <span className="text-xs">link</span>
          </ToolbarButton>
          {editor.isActive("link") && (
            <ToolbarButton
              active={false}
              title="Rimuovi link"
              onClick={() => editor.chain().focus().unsetLink().run()}
            >
              <span className="text-xs text-danger">✕link</span>
            </ToolbarButton>
          )}
        </div>

        {/* Editor area */}
        <div className="px-3 py-2.5 relative">
          {editor.isEmpty && placeholder && (
            <span className="absolute top-2.5 left-3 text-sm text-default-400 pointer-events-none select-none">
              {placeholder}
            </span>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
