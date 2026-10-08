import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";

interface BlogContentProps {
  content: JSONContent;
}

export default function JsonBlogCard({ content }: BlogContentProps) {
  return (
    <div
      className={[
        "min-w-0 text-base leading-7 wrap-break-words",

        // Paragraphs
        "[&_p]:my-4 [&_p]:whitespace-pre-wrap",

        // Headings
        "[&_h1]:mt-8 [&_h1]:mb-4",
        "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight",

        "[&_h2]:mt-6 [&_h2]:mb-3",
        "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight",

        "[&_h3]:mt-5 [&_h3]:mb-3",
        "[&_h3]:text-xl [&_h3]:font-semibold",

        // Bullet and numbered lists
        "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6",
        "[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:my-1",
        "[&_li>p]:my-1",
        "[&_li>ul]:my-2 [&_li>ol]:my-2",

        // Text formatting
        "[&_strong]:font-bold",
        "[&_em]:italic",
        "[&_u]:underline",
        "[&_s]:line-through",

        // Links
        "[&_a]:text-primary [&_a]:underline",
        "[&_a]:underline-offset-4",

        // Blockquotes
        "[&_blockquote]:my-5 [&_blockquote]:border-l-4",
        "[&_blockquote]:border-primary [&_blockquote]:pl-4",
        "[&_blockquote]:italic",

        // Inline code
        "[&_code]:rounded [&_code]:bg-muted",
        "[&_code]:px-1 [&_code]:py-0.5",
        "[&_code]:font-mono [&_code]:text-sm",

        // Code blocks
        "[&_pre]:my-5 [&_pre]:overflow-x-auto",
        "[&_pre]:rounded-lg [&_pre]:bg-zinc-900",
        "[&_pre]:p-4 [&_pre]:text-zinc-100",
        "[&_pre]:whitespace-pre [&_pre]:[overflow-wrap:normal]",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_pre_code]:text-inherit",

        // Highlights and horizontal rules
        "[&_mark]:rounded-sm [&_mark]:px-0.5",
        "[&_hr]:my-6 [&_hr]:border-border",

        // Avoid extra space at the boundaries
        "[&>:first-child]:mt-0",
        "[&>:last-child]:mb-0",
      ].join(" ")}
    >
      {renderToReactElement({
        extensions: [
          StarterKit.configure({
            heading: {
              levels: [1, 2, 3],
            },
            link: {
              openOnClick: false,
              defaultProtocol: "https",
              HTMLAttributes: {
                target: "_blank",
                rel: "noopener noreferrer",
              },
            },
          }),

          TextAlign.configure({
            types: ["heading", "paragraph"],
            defaultAlignment: "left",
          }),

          TextStyle,
          Color,

          Highlight.configure({
            multicolor: true,
          }),
        ],
        content,
      })}
    </div>
  );
}
