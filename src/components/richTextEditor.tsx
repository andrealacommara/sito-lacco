import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useRef, useCallback, useState, useEffect } from "react";
import {
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalFooter,
  Button,
  TextField,
  Label,
  Input,
} from "@heroui/react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  variant?: "bordered" | "flat";
};

type ToolbarButtonProps = {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? "bg-default-200 text-default-900"
          : "text-default-500 hover:bg-default-100 hover:text-default-800"
      }`}
      title={title}
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  variant = "bordered",
}: Props) {
  // Track whether the latest change came from inside the editor to avoid
  // calling setContent on every keystroke (which would lose the cursor).
  const lastEmitted = useRef<string>(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        // StarterKit ora include link/underline: li disabilitiamo qui per
        // configurarli esplicitamente sotto (evita "Duplicate extension names").
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "outline-none min-h-25 text-sm text-default-800 leading-relaxed rte-content",
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();

      lastEmitted.current = html;
      onChange(html);
    },
  });

  // Sync only when the parent resets the value externally (e.g. after send).
  // Skip if the change originated from inside the editor.
  useEffect(() => {
    if (editor && value !== lastEmitted.current && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
      lastEmitted.current = value;
    }
  }, [editor, value]);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const openLinkModal = useCallback(() => {
    if (!editor) return;
    setLinkUrl(editor.getAttributes("link").href ?? "");
    setLinkModalOpen(true);
  }, [editor]);

  const confirmLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl.trim()) {
      let href = linkUrl.trim();

      if (!/^[a-z]+:\/\//i.test(href)) {
        href = /^www\./i.test(href) ? `https://${href}` : `https://www.${href}`;
      }
      editor.chain().focus().setLink({ href }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkModalOpen(false);
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setLinkModalOpen(false);
  }, [editor]);

  if (!editor) return null;

  return (
    <>
      {/* Stile links nell'editor */}
      <style>{`
        .rte-content a { color: #F31260; text-decoration: underline; cursor: pointer; }
        .rte-content ul { list-style: disc; padding-left: 1.25rem; margin: 0.25rem 0; }
        .rte-content ol { list-style: decimal; padding-left: 1.25rem; margin: 0.25rem 0; }
        .rte-content li { margin-bottom: 2px; }
      `}</style>

      <div className="flex flex-col gap-0">
        <span className="text-sm font-medium mb-1.5">Testo email</span>
        <div
          className={
            variant === "flat"
              ? "rounded-xl bg-default-100 hover:bg-default-200 focus-within:bg-default-100 transition-colors"
              : "rounded-xl border-2 border-default-200 hover:border-default-400 focus-within:border-default-foreground transition-colors"
          }
        >
          {/* Toolbar */}
          <div
            className={`flex items-center gap-0.5 px-2 py-1.5 border-b ${variant === "flat" ? "border-default-200/60" : "border-default-200"}`}
          >
            <ToolbarButton
              active={editor.isActive("bold")}
              title="Grassetto"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .extendMarkRange("bold")
                  .toggleBold()
                  .run()
              }
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
              active={editor.isActive("link")}
              title={
                editor.isActive("link") ? "Modifica link" : "Inserisci link"
              }
              onClick={openLinkModal}
            >
              <span className="text-xs">
                {editor.isActive("link") ? "modifica link" : "link"}
              </span>
            </ToolbarButton>
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

      <ModalBackdrop
        isDismissable
        isOpen={linkModalOpen}
        onOpenChange={setLinkModalOpen}
      >
        <ModalContainer placement="center" size="sm">
          <ModalDialog>
            <ModalHeader>
              <ModalHeading className="text-base font-semibold">
                {editor.isActive("link") ? "Modifica link" : "Inserisci link"}
              </ModalHeading>
            </ModalHeader>
            <ModalBody>
              <TextField
                className="flex flex-col gap-1.5"
                type="url"
                value={linkUrl}
                onChange={setLinkUrl}
              >
                <Label>URL</Label>
                <Input
                  placeholder="https://…"
                  onKeyDown={(e) => e.key === "Enter" && confirmLink()}
                />
              </TextField>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              {editor.isActive("link") ? (
                <Button size="sm" variant="danger" onPress={removeLink}>
                  Rimuovi link
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => setLinkModalOpen(false)}
                >
                  Annulla
                </Button>
                <Button size="sm" variant="primary" onPress={confirmLink}>
                  Conferma
                </Button>
              </div>
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </>
  );
}
