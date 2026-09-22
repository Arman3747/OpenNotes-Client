import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";

interface BlogContentProps {
  content: JSONContent;
}

export default function JsonBlogCard({ content }: BlogContentProps) {
  return (
    <div className="space-y-4 text-base leading-7">
      {renderToReactElement({
        extensions: [StarterKit],
        content,
      })}
    </div>
  );
}
