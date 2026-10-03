"use client";

import { useState } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";

type EditorToolbarProps = {
  editor: Editor;
  disabled?: boolean;
};

export default function EditorToolbar({
  editor,
  disabled = false,
}: EditorToolbarProps) {
  const [linkError, setLinkError] = useState("");
//   for text highlight 
//   const [textColor, setTextColor] = useState("#2563eb");
//   const [highlightColor, setHighlightColor] = useState("#fef08a");

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      link: editor.isActive("link"),

      paragraph: editor.isActive("paragraph"),
      h1: editor.isActive("heading", { level: 1 }),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),

      left: editor.isActive({ textAlign: "left" }),
      center: editor.isActive({ textAlign: "center" }),
      right: editor.isActive({ textAlign: "right" }),
      justify: editor.isActive({ textAlign: "justify" }),

      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),

      blockquote: editor.isActive("blockquote"),
      codeBlock: editor.isActive("codeBlock"),
      highlight: editor.isActive("highlight"),

      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  const setLink = () => {
    setLinkError("");

    const existingHref = editor.getAttributes("link").href;
    const input = window.prompt(
      "Enter a link, for example https://example.com",
      typeof existingHref === "string" ? existingHref : "",
    );

    if (input === null) return;

    const value = input.trim();

    // An empty URL removes the existing link.
    if (!value) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Add https:// when the user enters only a domain.
    const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value)
      ? value
      : `https://${value}`;

    let url: URL;

    try {
      url = new URL(candidate);

      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Unsupported protocol");
      }
    } catch {
      setLinkError("Enter a valid HTTP or HTTPS link.");
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.href })
      .run();
  };

  const controls = [
    {
      label: "Paragraph",
      active: state.paragraph,
      run: () => editor.chain().focus().setParagraph().run(),
    },
    {
      label: "H1",
      active: state.h1,
      run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "H2",
      active: state.h2,
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "H3",
      active: state.h3,
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bold",
      active: state.bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      active: state.italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Underline",
      active: state.underline,
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Left",
      active: state.left,
      run: () => editor.chain().focus().setTextAlign("left").run(),
    },
    {
      label: "Center",
      active: state.center,
      run: () => editor.chain().focus().setTextAlign("center").run(),
    },
    {
      label: "Right",
      active: state.right,
      run: () => editor.chain().focus().setTextAlign("right").run(),
    },
    {
      label: "Justify",
      active: state.justify,
      run: () => editor.chain().focus().setTextAlign("justify").run(),
    },
    {
      label: "Bullet list",
      active: state.bulletList,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      active: state.orderedList,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Blockquote",
      active: state.blockquote,
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Code block",
      active: state.codeBlock,
      run: () => editor.chain().focus().toggleCodeBlock().run(),
    },
  ];

  return (
    <div className="space-y-2 border-b bg-muted/40 p-2">
      <div className="flex flex-wrap gap-1">
        {controls.map((control) => (
          <Button
            key={control.label}
            type="button"
            size="sm"
            variant={control.active ? "secondary" : "ghost"}
            aria-pressed={control.active}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => control.run()}
          >
            {control.label}
          </Button>
        ))}

        <Button
          type="button"
          size="sm"
          variant={state.link ? "secondary" : "ghost"}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={setLink}
        >
          {state.link ? "Edit link" : "Add link"}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled || !state.link}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
        >
          Remove link
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled || !state.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          Undo
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled || !state.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          Redo
        </Button>
      </div>

    {/* text hightlight
      <div className="flex flex-wrap items-center gap-3 border-t pt-2"> */}
        {/* Text color */}
        {/* <div className="flex items-center gap-1">
          <label className="flex items-center gap-2 text-sm">
            Text color
            <input
              type="color"
              value={textColor}
              disabled={disabled || state.codeBlock}
              onChange={(event) => setTextColor(event.target.value)}
              className="h-8 w-9 cursor-pointer rounded border p-0.5"
            />
          </label> */}

          {/* <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || state.codeBlock}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().setColor(textColor).run()}
          >
            Apply color
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled || state.codeBlock}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().unsetColor().run()}
          >
            Reset color
          </Button>
        </div> */}

        {/* Highlight color */}
        {/* <div className="flex items-center gap-1">
          <label className="flex items-center gap-2 text-sm">
            Highlight
            <input
              type="color"
              value={highlightColor}
              disabled={disabled || state.codeBlock}
              onChange={(event) => setHighlightColor(event.target.value)}
              className="h-8 w-9 cursor-pointer rounded border p-0.5"
            />
          </label>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || state.codeBlock}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              editor
                .chain()
                .focus()
                .setHighlight({ color: highlightColor })
                .run()
            }
          >
            Apply highlight
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled || !state.highlight}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().unsetHighlight().run()}
          >
            Remove highlight
          </Button>
        </div>

        
      </div> */}

      {linkError && (
        <p role="alert" className="text-sm text-destructive">
          {linkError}
        </p>
      )}
    </div>
  );
}
